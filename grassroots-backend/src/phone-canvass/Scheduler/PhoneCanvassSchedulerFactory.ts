/* eslint-disable grassroots/entity-use */
import { Injectable } from "@nestjs/common";
import { PhoneCanvassContactEntity } from "../entities/PhoneCanvassContact.entity.js";
import { PhoneCanvassMetricsTracker } from "./PhoneCanvassMetricsTracker.js";
import { PhoneCanvassScheduler } from "./PhoneCanvassScheduler.js";
import { PhoneCanvassSchedulerImpl } from "./PhoneCanvassSchedulerImpl.js";
import { NoOvercallingStrategy } from "./Strategies/NoOvercallingStrategy.js";
import { Observable } from "rxjs";
import { Call } from "./PhoneCanvassCall.js";

@Injectable()
export class PhoneCanvassSchedulerFactory {
  createScheduler(params: {
    contacts: PhoneCanvassContactEntity[];
    phoneCanvassId: string;
    calls$: Observable<Call>;
  }): PhoneCanvassScheduler {
    const metricsTracker = new PhoneCanvassMetricsTracker();
    const strategy = new NoOvercallingStrategy(metricsTracker);
    return new PhoneCanvassSchedulerImpl(strategy, metricsTracker, params);
  }
}
