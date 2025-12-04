import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  scan,
  share,
  shareReplay,
  startWith,
} from "rxjs";
import { Call } from "./PhoneCanvassCall.js";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PhoneCanvassMetricsTracker {
  #readyCallerCountObservable = new BehaviorSubject<number>(0);
  #committedCallsCountObservable: Observable<number>;

  readonly #idleCallerCountObservable: Observable<number>;

  get callerCountObservable(): Observable<number> {
    return this.#readyCallerCountObservable;
  }

  get committedCallerCountObservable(): Observable<number> {
    return this.#committedCallsCountObservable;
  }

  get idleCallerCountObservable(): Observable<number> {
    return this.#idleCallerCountObservable;
  }

  constructor(calls$: Observable<Call>) {
    this.#committedCallsCountObservable = calls$.pipe(
      scan((committedCalls: Set<number>, call: Call): Set<number> => {
        if (call.status === "NOT_STARTED") {
          committedCalls.add(call.id);
          return committedCalls;
        }
        if (call.status === "COMPLETED") {
          committedCalls.delete(call.id);
          return committedCalls;
        }
        return committedCalls;
      }, new Set<number>()),
      map((committedCalls) => committedCalls.size),
      distinctUntilChanged(),
      startWith(0),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.#idleCallerCountObservable = combineLatest([
      this.#readyCallerCountObservable,
      this.#committedCallsCountObservable,
    ]).pipe(
      map(
        ([callerCount, committedCallsCount]) =>
          callerCount - committedCallsCount,
      ),
      share(),
    );
  }

  onReadyCallerCountUpdate(callerCount: number): void {
    console.log("SETTING READY CALLER COUNT TO ", callerCount);
    this.#readyCallerCountObservable.next(callerCount);
  }
}
