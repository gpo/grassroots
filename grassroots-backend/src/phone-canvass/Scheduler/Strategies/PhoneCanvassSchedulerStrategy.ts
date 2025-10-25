import { PhoneCanvassMetricsTracker } from "../PhoneCanvassMetricsTracker.js";

export abstract class PhoneCanvassSchedulerStrategy {
  constructor(protected readonly metricsLogger: PhoneCanvassMetricsTracker) {
    console.log("STRATEGY INIT", metricsLogger);
  }
  abstract waitForNextCall(): Promise<void>;
}
