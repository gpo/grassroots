import { PhoneCanvassMetricsLogger } from "../PhoneCanvassMetricsTracker.js";

export abstract class PhoneCanvassSchedulerStrategy {
  constructor(protected readonly metricsLogger: PhoneCanvassMetricsLogger) {}
  abstract waitForNextCall(): Promise<void>;
}
