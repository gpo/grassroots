import { Observable } from "rxjs";
import {
  CompletedCall,
  InitiatedCall,
  InProgressCall,
  NotStartedCall,
  RingingCall,
} from "./PhoneCanvassCall.js";
import { PhoneCanvassMetricsTracker as PhoneCanvassMetricsTracker } from "./PhoneCanvassMetricsTracker.js";

export interface Caller {
  id: number;
  availabilityStartTime: number /* Relative to Date.now()*/;
}

export abstract class PhoneCanvassScheduler {
  abstract readonly calls: Observable<NotStartedCall>;
  abstract startIfNeeded(): Promise<void>;
  abstract stop(): void;
  abstract addCaller(id: number): void;
  abstract removeCaller(id: number): void;
  abstract waitForIdleForTest(): Promise<void>;
  abstract getNextIdleCallerId(): number | undefined;
  abstract get metricsTracker(): PhoneCanvassMetricsTracker;
  abstract get phoneCanvassId(): string;
  abstract get callsByStatus(): {
    NOT_STARTED: Map<number, NotStartedCall>;
    QUEUED: Map<number, RingingCall>;
    INITIATED: Map<number, InitiatedCall>;
    RINGING: Map<number, RingingCall>;
    IN_PROGRESS: Map<number, InProgressCall>;
    COMPLETED: Map<number, CompletedCall>;
  };
}
