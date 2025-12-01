import { PhoneCanvassMetricsTracker as PhoneCanvassMetricsTracker } from "./PhoneCanvassMetricsTracker.js";

export interface Caller {
  id: number;
  availabilityStartTime: number /* Relative to Date.now()*/;
}

export abstract class PhoneCanvassScheduler {
  abstract stop(): void;
  abstract addCaller(id: string): void;
  abstract removeCaller(id: string): void;
  abstract waitForIdleForTest(): Promise<void>;
  abstract getNextIdleCallerId(): number | undefined;
  abstract get metricsTracker(): PhoneCanvassMetricsTracker;
  abstract get phoneCanvassId(): string;
  abstract mockCurrentTime(getTime: () => number): void;
}
