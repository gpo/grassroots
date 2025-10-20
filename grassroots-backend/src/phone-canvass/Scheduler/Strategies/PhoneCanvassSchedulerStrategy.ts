import { PhoneCanvassMetricsLogger } from "../PhoneCanvassMetricsTracker.js";

export abstract class PhoneCanvassSchedulerStrategy {
  protected metricsLogger: PhoneCanvassMetricsLogger;
  constructor(metricsLogger: PhoneCanvassMetricsLogger) {
    this.metricsLogger = metricsLogger;
  }
  abstract waitForNextCall(): Promise<void>;
}
