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
  #readyCallerCount$ = new BehaviorSubject<number>(0);
  #committedCallsCount$: Observable<number>;
  #activeSuccessfulCallsCount$: Observable<number>;

  readonly #idleCallerCount$: Observable<number>;

  get readyCallerCount$(): Observable<number> {
    return this.#readyCallerCount$;
  }

  get committedCallsCount(): Observable<number> {
    return this.#committedCallsCount$;
  }

  get activeSuccessfulCallsCount$(): Observable<number> {
    return this.#activeSuccessfulCallsCount$;
  }

  get idleCallerCountObservable(): Observable<number> {
    return this.#idleCallerCount$;
  }

  constructor(calls$: Observable<Call>) {
    this.#committedCallsCount$ = calls$.pipe(
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
    // TODO: does forcing an early subscribe get this to happen earlier, avoiding an
    // issue with ordering in the expected faiure rate strategy?
    this.#committedCallsCount$.subscribe();

    // TODO: refactor this and committedCallsCountObservable.
    this.#activeSuccessfulCallsCount$ = calls$.pipe(
      scan((successfulCalls: Set<number>, call: Call): Set<number> => {
        if (call.status === "IN_PROGRESS") {
          successfulCalls.add(call.id);
          return successfulCalls;
        }
        if (call.status === "COMPLETED") {
          successfulCalls.delete(call.id);
          return successfulCalls;
        }
        return successfulCalls;
      }, new Set<number>()),
      map((successfulCalls) => successfulCalls.size),
      distinctUntilChanged(),
      startWith(0),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.#idleCallerCount$ = combineLatest([
      this.#readyCallerCount$,
      this.#committedCallsCount$,
    ]).pipe(
      map(
        ([callerCount, committedCallsCount]) =>
          callerCount - committedCallsCount,
      ),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  onReadyCallerCountUpdate(callerCount: number): void {
    this.#readyCallerCount$.next(callerCount);
  }
}
