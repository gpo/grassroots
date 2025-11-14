import { PhoneCanvassMetricsTracker } from "../PhoneCanvassMetricsTracker.js";

export abstract class PhoneCanvassSchedulerStrategy {
  constructor(protected readonly metricsLogger: PhoneCanvassMetricsTracker) {}
  abstract waitForNextCall(): Promise<void>;
}
