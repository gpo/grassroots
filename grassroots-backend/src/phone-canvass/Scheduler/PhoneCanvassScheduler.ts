import { Observable } from "rxjs";
import { PhoneCanvassMetricsTracker as PhoneCanvassMetricsTracker } from "./PhoneCanvassMetricsTracker.js";
import { PhoneCanvassContactEntity } from "../entities/PhoneCanvassContact.entity.js";

export interface Caller {
  id: number;
  availabilityStartTime: number /* Relative to Date.now()*/;
}

export abstract class PhoneCanvassScheduler {
  abstract stop(): void;
  abstract addCaller(id: number): void;
  abstract removeCaller(id: number): void;
  abstract waitForIdleForTest(): Promise<void>;
  abstract getNextIdleCallerId(): number | undefined;
  abstract get metricsTracker(): PhoneCanvassMetricsTracker;
  abstract get phoneCanvassId(): string;
  // eslint-disable-next-line grassroots/entity-use
  abstract get pendingContacts$(): Observable<PhoneCanvassContactEntity>;
}
