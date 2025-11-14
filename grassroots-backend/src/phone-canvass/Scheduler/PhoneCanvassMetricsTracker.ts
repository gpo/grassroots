import { BehaviorSubject, combineLatest, map, Observable, Subject } from "rxjs";
import { Call, CompletedCall } from "./PhoneCanvassCall.js";
import { PhoneCanvassScheduler } from "./PhoneCanvassScheduler.js";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PhoneCanvassMetricsTracker {
  #endingCallsObservable = new Subject<CompletedCall>();
  #callerCountObservable = new BehaviorSubject<number>(0);
  #committedCallsCountObservable = new BehaviorSubject<number>(0);

  readonly #idleCallerCountObservable = new Observable<number>();

  get endingCalls(): Observable<CompletedCall> {
    return this.endingCalls;
  }

  get callerCountObservable(): Observable<number> {
    return this.#callerCountObservable;
  }

  get committedCallerCountObservable(): Observable<number> {
    return this.#committedCallsCountObservable;
  }

  get idleCallerCountObservable(): Observable<number> {
    return this.#idleCallerCountObservable;
  }

  constructor() {
    this.#idleCallerCountObservable = combineLatest([
      this.#callerCountObservable,
      this.#committedCallsCountObservable,
    ]).pipe(
      map(
        ([callerCount, committedCallsCount]) =>
          callerCount - committedCallsCount,
      ),
    );

    this.#endingCallsObservable.subscribe((call: Call) => {
      console.log(`Recording metrics about ${String(call.id)}`);
    });
  }

  onEndingCall(call: CompletedCall): void {
    this.#endingCallsObservable.next(call);
  }

  onCallsByStatusUpdate(
    callsByStatus: PhoneCanvassScheduler["callsByStatus"],
  ): void {
    this.#committedCallsCountObservable.next(
      callsByStatus.NOT_STARTED.size +
        callsByStatus.INITIATED.size +
        callsByStatus.QUEUED.size +
        callsByStatus.RINGING.size +
        callsByStatus.IN_PROGRESS.size,
    );
  }

  onCallerCountUpdate(callerCount: number): void {
    this.#callerCountObservable.next(callerCount);
  }
}
