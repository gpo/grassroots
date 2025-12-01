import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  scan,
  shareReplay,
  startWith,
} from "rxjs";
import { Call } from "./PhoneCanvassCall.js";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PhoneCanvassMetricsTracker {
  #callerCountObservable = new BehaviorSubject<number>(0);
  #committedCallsCountObservable: Observable<number>;

  readonly #idleCallerCountObservable: Observable<number>;

  get callerCountObservable(): Observable<number> {
    return this.#callerCountObservable;
  }

  get committedCallerCountObservable(): Observable<number> {
    return this.#committedCallsCountObservable;
  }

  get idleCallerCountObservable(): Observable<number> {
    return this.#idleCallerCountObservable;
  }

  constructor(calls$: Observable<Call>) {
    this.#committedCallsCountObservable = calls$.pipe(
      scan((committedCalls: number, call: Call): number => {
        if (call.status === "NOT_STARTED") {
          console.log(
            "UPDATING COMMITTED CALLS FROM",
            committedCalls,
            call.status,
          );
          return committedCalls + 1;
        }
        if (call.status === "COMPLETED") {
          console.log(
            "UPDATING COMMITTED CALLS FROM",
            committedCalls,
            call.status,
          );
          return committedCalls - 1;
        }
        return committedCalls;
      }, 0),
      distinctUntilChanged(),
      startWith(0),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.#idleCallerCountObservable = combineLatest([
      this.#callerCountObservable,
      this.#committedCallsCountObservable,
    ]).pipe(
      map(
        ([callerCount, committedCallsCount]) =>
          callerCount - committedCallsCount,
      ),
    );
  }

  onCallerCountUpdate(callerCount: number): void {
    this.#callerCountObservable.next(callerCount);
  }
}
