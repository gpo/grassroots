import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  scan,
  startWith,
  tap,
} from "rxjs";
import { Call } from "./PhoneCanvassCall.js";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PhoneCanvassMetricsTracker {
  #callerCountObservable = new BehaviorSubject<number>(0);
  #committedCallsCountObservable: Observable<number>;

  readonly #idleCallerCountObservable = new Observable<number>();

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
      tap((call) => {
        console.log("GOT CALL", call);
      }),
      scan((activeCalls: number, call: Call): number => {
        console.log("LOOKING FOR COMMITTED CALLS", activeCalls, call);
        if (call.status === "QUEUED") {
          return activeCalls + 1;
        }
        if (call.status === "COMPLETED") {
          return activeCalls - 1;
        }
        return activeCalls;
      }, 0),
      distinctUntilChanged(),
      startWith(0),
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
