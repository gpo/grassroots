/* eslint-disable grassroots/entity-use */
import { Injectable } from "@nestjs/common";
import {
  firstValueFrom,
  filter,
  Observable,
  Subscription,
  from,
  zip,
  map,
  Subject,
  tap,
} from "rxjs";
import { PhoneCanvassContactEntity } from "../entities/PhoneCanvassContact.entity.js";
import { Call } from "./PhoneCanvassCall.js";
import { PhoneCanvassMetricsTracker } from "./PhoneCanvassMetricsTracker.js";
import { Caller, PhoneCanvassScheduler } from "./PhoneCanvassScheduler.js";
import { PhoneCanvassSchedulerStrategy } from "./Strategies/PhoneCanvassSchedulerStrategy.js";
import { PhoneCanvassCallerDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";

@Injectable()
export class PhoneCanvassSchedulerImpl extends PhoneCanvassScheduler {
  readonly #calls$: Subject<Call>;
  readonly callsSubscription: Subscription;

  #strategy: PhoneCanvassSchedulerStrategy;
  readonly phoneCanvassId: string;
  readonly #busyCallerIds = new Set<string>();

  // We need to track both "ready" callers (to know if we should make more calls)
  // and callers who are either "ready" or "last call" (to know who to assign calls to).
  // `#callerSummariesById` includes "last call" callers.
  #callerSummariesById = new Map<string, Caller>();
  // `#readyCallerIds` doesn't include "last call" callers.
  #readyCallerIds = new Set<string>();

  #callers$: Observable<PhoneCanvassCallerDTO>;
  #pendingContacts$: Observable<PhoneCanvassContactEntity>;

  #getCurrentTime: () => number;

  constructor(
    strategy: PhoneCanvassSchedulerStrategy,
    public metricsTracker: PhoneCanvassMetricsTracker,
    params: {
      contacts: PhoneCanvassContactEntity[];
      phoneCanvassId: string;
      calls$: Subject<Call>;
      callers$: Observable<PhoneCanvassCallerDTO>;
    },
  ) {
    super();
    this.#strategy = strategy;
    this.phoneCanvassId = params.phoneCanvassId;
    this.#calls$ = params.calls$;
    this.#callers$ = params.callers$;

    this.#getCurrentTime = (): number => {
      return Date.now();
    };

    this.#pendingContacts$ = from(params.contacts).pipe(
      filter((contact) => !contact.beenCalled),
    );

    // TODO(mvp): handle when we run out of contacts.
    this.callsSubscription = zip(
      this.#strategy.nextCall$,
      this.#pendingContacts$,
    )
      .pipe(
        // We only care about the pending contact.
        map((x) => x[1]),
        map((contact) => {
          return new Call("NOT_STARTED", {
            contact,
            phoneCanvassId: this.phoneCanvassId,
            emit: (call): void => {
              this.#calls$.next(call);
            },
          });
        }),
      )
      .subscribe();

    this.#calls$.subscribe((call) => {
      if (call.callerId !== undefined) {
        if (call.status === "COMPLETED") {
          this.#busyCallerIds.delete(call.callerId);
        } else {
          this.#busyCallerIds.add(call.callerId);
        }
      }
    });

    this.#callers$.subscribe((caller) => {
      switch (caller.ready) {
        case "ready": {
          console.log("READY");
          this.#callerSummariesById.set(caller.id, {
            id: caller.id,
            availabilityStartTime: this.#getCurrentTime(),
          });
          this.#readyCallerIds.add(caller.id);
          break;
        }
        case "unready": {
          console.log("UNREADY");
          this.#callerSummariesById.delete(caller.id);
          this.#readyCallerIds.delete(caller.id);
          break;
        }
        case "last call": {
          console.log("LAST CALL");
          this.#readyCallerIds.delete(caller.id);
          break;
        }
      }
      console.log("ALL CALLERS:", this.#callerSummariesById);
      console.log("READY:", this.#readyCallerIds.size);
      this.metricsTracker.onReadyCallerCountUpdate(this.#readyCallerIds.size);
    });
  }

  stop(): void {
    this.callsSubscription.unsubscribe();
  }

  mockCurrentTime(getTime: () => number): void {
    this.#getCurrentTime = getTime;
  }

  async waitForIdleForTest(): Promise<void> {
    // To be considered idle we either need no contacts remaining.
    if (this.callsSubscription.closed) {
      return;
    }
    // or all callers assigned to calls.
    await firstValueFrom(
      this.metricsTracker.idleCallerCountObservable.pipe(
        tap((v) => {
          console.log("WAITING FOR ZERO", v);
        }),
        filter((v) => v === 0),
      ),
    );
  }

  getNextIdleCallerId(): string | undefined {
    // Find the idle caller who has been available for the longest time.
    const availableCallers = [...this.#callerSummariesById.values()].filter(
      (caller) => {
        return !this.#busyCallerIds.has(caller.id);
      },
    );

    const firstAvailableCaller = availableCallers.pop();
    if (firstAvailableCaller === undefined) {
      return undefined;
    }

    const oldestAvailableCaller = availableCallers.reduce(
      (oldest: Caller, current: Caller) => {
        return oldest.availabilityStartTime < current.availabilityStartTime
          ? oldest
          : current;
      },
      firstAvailableCaller,
    );

    return oldestAvailableCaller.id;
  }
}
