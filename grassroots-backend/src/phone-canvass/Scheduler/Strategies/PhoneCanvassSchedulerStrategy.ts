import { Observable } from "rxjs";
import { PhoneCanvassMetricsTracker } from "../PhoneCanvassMetricsTracker.js";

export abstract class PhoneCanvassSchedulerStrategy {
  constructor(protected readonly metricsLogger: PhoneCanvassMetricsTracker) {}
  abstract get nextCall$(): Observable<undefined>;
}
