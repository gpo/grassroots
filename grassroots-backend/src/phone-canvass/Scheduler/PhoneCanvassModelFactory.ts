/* eslint-disable grassroots/entity-use */
import { Injectable } from "@nestjs/common";
import { PhoneCanvassContactEntity } from "../entities/PhoneCanvassContact.entity.js";
import { PhoneCanvassMetricsTracker } from "./PhoneCanvassMetricsTracker.js";
import { PhoneCanvassSchedulerImpl } from "./PhoneCanvassSchedulerImpl.js";
import { ReplaySubject, Subject } from "rxjs";
import { Call } from "./PhoneCanvassCall.js";
import { TwilioService } from "../Twilio.service.js";
import { PhoneCanvassModel } from "../PhoneCanvass.model.js";
import { PhoneCanvassCallersModel } from "../PhoneCanvassCallers.model.js";
import { ServerMetaService } from "../../server-meta/ServerMeta.service.js";
import { EntityManager } from "@mikro-orm/core";
import { PhoneCanvassCallerDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { ExpectedFailureRateStrategy } from "./Strategies/ExpectedFailureRateStrategy.js";
import { PhoneCanvassSchedulerStrategy } from "./Strategies/PhoneCanvassSchedulerStrategy.js";
import { NoOvercallingStrategy } from "./Strategies/NoOvercallingStrategy.js";

interface ObservablesForTest {
  callers$: Subject<Readonly<PhoneCanvassCallerDTO>>;
}

let lastObservablesForTest: ObservablesForTest | undefined;

type StrategyName = "no overcalling" | "expected failure rate";

@Injectable()
export class PhoneCanvassModelFactory {
  createModel(params: {
    twilioService: TwilioService;
    phoneCanvassId: string;
    contacts: PhoneCanvassContactEntity[];
    entityManager: EntityManager;
    serverMetaService: ServerMetaService;
    strategyName: StrategyName;
  }): PhoneCanvassModel {
    // Creating these observables here makes it a bit easier to reason about ownership.
    // None of these objects own them!
    // TODO: figure out how to clean these up when we're done with them...
    const calls$ = new ReplaySubject<Call>(1);
    const callers$ = new Subject<Readonly<PhoneCanvassCallerDTO>>();

    lastObservablesForTest = {
      callers$,
    };

    const metricsTracker = new PhoneCanvassMetricsTracker(calls$);
    let strategy: PhoneCanvassSchedulerStrategy;
    if (params.strategyName === "no overcalling") {
      strategy = new NoOvercallingStrategy(metricsTracker);
    } else {
      strategy = new ExpectedFailureRateStrategy(metricsTracker, 0.6);
    }

    const scheduler = new PhoneCanvassSchedulerImpl(strategy, metricsTracker, {
      phoneCanvassId: params.phoneCanvassId,
      contacts: params.contacts,
      calls$,
      callers$,
    });
    const phoneCanvassCallersModel = new PhoneCanvassCallersModel({
      callers: callers$,
    });
    return new PhoneCanvassModel({
      calls$,
      contacts: params.contacts,
      phoneCanvassId: params.phoneCanvassId,
      scheduler,
      twilioService: params.twilioService,
      phoneCanvassCallersModel,
      entityManager: params.entityManager,
      serverMetaService: params.serverMetaService,
    });
  }
}

export function getLastObservablesForTest(): ObservablesForTest {
  if (lastObservablesForTest === undefined) {
    throw new Error("getLastObservablesForTest called before createModel");
  }
  return lastObservablesForTest;
}
