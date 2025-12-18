import {
  distinctUntilChanged,
  map,
  Observable,
  scan,
  shareReplay,
  startWith,
} from "rxjs";
import { Call } from "./PhoneCanvassCall.js";
import { Injectable } from "@nestjs/common";
import { CallAndCaller } from "../PhoneCanvass.model.js";
import { PhoneCanvassCallerDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";

interface CallCounts {
  committed: number;
  active: number;
}

export interface CallAndCallerCounts {
  callers: {
    ready_no_contact: number;
    ready_with_contact: number;
    unready: number;
  };
  calls: CallCounts;
}

@Injectable()
export class PhoneCanvassMetricsTracker {
  #callAndCallerCounts$ = new Observable<CallAndCallerCounts>();

  readonly #idleCallerCount$: Observable<number>;

  get callAndCallerCounts$(): Observable<CallAndCallerCounts> {
    return this.#callAndCallerCounts$;
  }

  get idleCallerCountObservable(): Observable<number> {
    return this.#idleCallerCount$;
  }

  constructor(callsAndCallers$: Observable<CallAndCaller>) {
    this.#callAndCallerCounts$ = callsAndCallers$.pipe(
      scan(
        (acc, { caller, call }) => {
          if (caller !== undefined) {
            acc.callers.set(caller.id, caller);
          }
          if (call !== undefined) {
            if (call.callerId !== undefined) {
              acc.callsByCallerId.set(call.callerId, call);
            }

            switch (call.status) {
              case "NOT_STARTED":
                acc.callsByState.committed.add(call.id);
                break;
              case "IN_PROGRESS":
                acc.callsByState.active.add(call.id);
                break;
              case "COMPLETED":
                acc.callsByState.committed.delete(call.id);
                acc.callsByState.active.delete(call.id);
            }
          }

          return acc;
        },
        {
          callsByCallerId: new Map<string, Call>(),
          callers: new Map<string, PhoneCanvassCallerDTO>(),
          callsByState: {
            active: new Set<number>(),
            committed: new Set<number>(),
          },
        },
      ),
      map(({ callsByCallerId, callers, callsByState }) => {
        return [...callers.values()].reduce(
          (acc: CallAndCallerCounts, caller: PhoneCanvassCallerDTO) => {
            if (caller.ready === "unready") {
              acc.callers.unready++;
            } else {
              const call = callsByCallerId.get(caller.id);
              if (call === undefined) {
                acc.callers.ready_no_contact++;
              } else {
                acc.callers.ready_with_contact++;
              }
            }
            return acc;
          },
          {
            callers: {
              ready_no_contact: 0,
              ready_with_contact: 0,
              unready: 0,
            },
            // This is just passed through.
            calls: {
              committed: callsByState.committed.size,
              active: callsByState.active.size,
            },
          } satisfies CallAndCallerCounts,
        );
      }),
      distinctUntilChanged(),
      startWith({
        callers: {
          ready_no_contact: 0,
          ready_with_contact: 0,
          unready: 0,
        },
        // This is just passed through.
        calls: {
          committed: 0,
          active: 0,
        },
      } satisfies CallAndCallerCounts),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.#idleCallerCount$ = this.#callAndCallerCounts$.pipe(
      map(
        ({ calls, callers }) =>
          callers.ready_no_contact +
          callers.ready_with_contact -
          calls.committed,
      ),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }
}
