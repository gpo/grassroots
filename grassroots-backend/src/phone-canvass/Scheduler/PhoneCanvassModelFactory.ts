/* eslint-disable grassroots/entity-use */
import { Injectable } from "@nestjs/common";
import { PhoneCanvassContactEntity } from "../entities/PhoneCanvassContact.entity.js";
import { PhoneCanvassMetricsTracker } from "./PhoneCanvassMetricsTracker.js";
import { PhoneCanvassSchedulerImpl } from "./PhoneCanvassSchedulerImpl.js";
import { NoOvercallingStrategy } from "./Strategies/NoOvercallingStrategy.js";
import { ReplaySubject } from "rxjs";
import { Call } from "./PhoneCanvassCall.js";
import { TwilioService } from "../Twilio.service.js";
import { PhoneCanvassModel } from "../PhoneCanvass.model.js";
import { PhoneCanvassCallersModel } from "../PhoneCanvassCallers.model.js";
import { ServerMetaService } from "../../server-meta/ServerMeta.service.js";
import { EntityManager } from "@mikro-orm/core";

@Injectable()
export class PhoneCanvassModelFactory {
  createModel(params: {
    twilioService: TwilioService;
    phoneCanvassId: string;
    contacts: PhoneCanvassContactEntity[];
    entityManager: EntityManager;
    serverMetaService: ServerMetaService;
  }): PhoneCanvassModel {
    // Creating this observable here avoid a cyclic dependency.
    const calls$ = new ReplaySubject<Call>(1);
    const metricsTracker = new PhoneCanvassMetricsTracker(calls$);
    const strategy = new NoOvercallingStrategy(metricsTracker);
    const scheduler = new PhoneCanvassSchedulerImpl(strategy, metricsTracker, {
      phoneCanvassId: params.phoneCanvassId,
      contacts: params.contacts,
      calls$,
    });
    const phoneCanvassCallersModel = new PhoneCanvassCallersModel();
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
