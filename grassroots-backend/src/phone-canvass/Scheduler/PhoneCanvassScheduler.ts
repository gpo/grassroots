import { PhoneCanvassMetricsTracker as PhoneCanvassMetricsTracker } from "./PhoneCanvassMetricsTracker.js";

export interface Caller {
  id: string;
  availabilityStartTime: number /* Relative to Date.now()*/;
}

export abstract class PhoneCanvassScheduler {
  abstract stop(): void;
  abstract waitForIdleForTest(): Promise<void>;
  abstract getNextIdleCallerId(): string | undefined;
  abstract get metricsTracker(): PhoneCanvassMetricsTracker;
  abstract get phoneCanvassId(): string;
  abstract mockCurrentTime(getTime: () => number): void;
}
