import { PhoneCanvassMetricsTracker } from "../PhoneCanvassMetricsTracker.js";

export abstract class PhoneCanvassSchedulerStrategy {
  protected metricsLogger: PhoneCanvassMetricsTracker;
  constructor(metricsLogger: PhoneCanvassMetricsTracker) {
    this.metricsLogger = metricsLogger;
  }
  abstract waitForNextCall(): Promise<void>;
}
