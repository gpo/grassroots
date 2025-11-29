import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  scan,
  shareReplay,
  startWith,
  tap,
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
          return committedCalls + 1;
        }
        if (call.status === "COMPLETED") {
          return committedCalls - 1;
        }
        return committedCalls;
      }, 0),
      distinctUntilChanged(),
      startWith(0),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.#callerCountObservable.subscribe((callerCount) => {
      console.log("CALLER COUNT ", callerCount);
    });
    this.#committedCallsCountObservable.subscribe((committedCalls) => {
      console.log("COMMITTED CALLS ", committedCalls);
    });

    this.#idleCallerCountObservable = combineLatest([
      this.#callerCountObservable,
      this.#committedCallsCountObservable,
    ]).pipe(
      tap(([callerCount, committedCallsCount]) => {
        console.log(
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          `IDLE COUNT: ${callerCount - committedCallsCount}, callers: ${callerCount}, calls: ${committedCallsCount}`,
        );
      }),

      map(
        ([callerCount, committedCallsCount]) =>
          callerCount - committedCallsCount,
      ),
    );
  }

  onCallerCountUpdate(callerCount: number): void {
    console.log("CALLER COUNT IS ", callerCount);
    this.#callerCountObservable.next(callerCount);
  }
}
