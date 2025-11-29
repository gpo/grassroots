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

@Injectable()
export class PhoneCanvassSchedulerImpl extends PhoneCanvassScheduler {
  readonly #calls$: Subject<Call>;
  readonly callsSubscription: Subscription;

  #strategy: PhoneCanvassSchedulerStrategy;
  readonly phoneCanvassId: string;
  readonly #busyCallerIds = new Set<number>();

  // From caller id.
  #callers = new Map<number, Caller>();
  #pendingContacts$: Observable<PhoneCanvassContactEntity>;

  #getCurrentTime: () => number;

  constructor(
    strategy: PhoneCanvassSchedulerStrategy,
    public metricsTracker: PhoneCanvassMetricsTracker,
    params: {
      contacts: PhoneCanvassContactEntity[];
      phoneCanvassId: string;
      calls$: Subject<Call>;
    },
  ) {
    super();
    this.#strategy = strategy;
    this.phoneCanvassId = params.phoneCanvassId;
    this.#calls$ = params.calls$;

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

  getNextIdleCallerId(): number | undefined {
    // Find the idle caller who has been available for the longest time.
    const availableCallers = [...this.#callers.values()].filter((caller) => {
      return !this.#busyCallerIds.has(caller.id);
    });

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

  addCaller(id: number): void {
    this.#callers.set(id, {
      id,
      availabilityStartTime: this.#getCurrentTime(),
    });
    this.metricsTracker.onCallerCountUpdate(this.#callers.size);
  }

  removeCaller(id: number): void {
    const removed = this.#callers.delete(id);
    if (!removed) {
      // This can happen due to a server restart, causing us to forget this caller exists.
      return;
    }
    this.metricsTracker.onCallerCountUpdate(this.#callers.size);
  }
}
