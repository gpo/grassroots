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

export interface CallerCounts {
  ready_no_caller: number;
  ready_with_caller: number;
  unready: number;
}

@Injectable()
export class PhoneCanvassMetricsTracker {
  #callerCounts$ = new BehaviorSubject<CallerCounts>({
    ready_no_caller: 0,
    ready_with_caller: 0,
    unready: 0,
  });
  #committedAndActiveCallCounts$: Observable<{
    committed: number;
    active: number;
  }>;

  readonly #idleCallerCount$: Observable<number>;

  get callerCounts$(): Observable<CallerCounts> {
    return this.#callerCounts$;
  }

  get committedAndActiveCallCounts(): Observable<{
    committed: number;
    active: number;
  }> {
    return this.#committedAndActiveCallCounts$;
  }

  get idleCallerCountObservable(): Observable<number> {
    return this.#idleCallerCount$;
  }

  constructor(calls$: Observable<Call>) {
    interface CommittedAndActiveCallCounts {
      committed: Set<number>;
      active: Set<number>;
    }
    this.#committedAndActiveCallCounts$ = calls$.pipe(
      scan(
        (
          counts: CommittedAndActiveCallCounts,
          call: Call,
        ): CommittedAndActiveCallCounts => {
          switch (call.status) {
            case "NOT_STARTED":
              counts.committed.add(call.id);
              break;
            case "IN_PROGRESS":
              counts.active.add(call.id);
              break;
            case "COMPLETED":
              counts.committed.delete(call.id);
              counts.active.delete(call.id);
          }

          return counts;
        },
        { committed: new Set<number>(), active: new Set<number>() },
      ),
      map((sets) => {
        return { committed: sets.committed.size, active: sets.active.size };
      }),
      distinctUntilChanged(),
      tap((counts) => {
        console.log("Call Counts", counts);
      }),
      startWith({ committed: 0, active: 0 }),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.#idleCallerCount$ = combineLatest([
      this.#callerCounts$,
      this.#committedAndActiveCallCounts$,
    ]).pipe(
      tap(([callerCounts, committedAndActiveCallCounts]) => {
        console.log("BWA", { callerCounts, committedAndActiveCallCounts });
      }),
      map(
        ([callerCounts, committedAndActiveCallCounts]) =>
          callerCounts.ready_no_caller +
          callerCounts.ready_with_caller -
          committedAndActiveCallCounts.committed,
      ),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  onCallerCountUpdate(callerCounts: CallerCounts): void {
    this.#callerCounts$.next(callerCounts);
  }
}
