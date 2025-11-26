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
} from "rxjs";
import { PhoneCanvassContactEntity } from "../entities/PhoneCanvassContact.entity.js";
import { Call } from "./PhoneCanvassCall.js";
import { PhoneCanvassMetricsTracker } from "./PhoneCanvassMetricsTracker.js";
import { Caller, PhoneCanvassScheduler } from "./PhoneCanvassScheduler.js";
import { PhoneCanvassSchedulerStrategy } from "./Strategies/PhoneCanvassSchedulerStrategy.js";

@Injectable()
export class PhoneCanvassSchedulerImpl extends PhoneCanvassScheduler {
  // Shared with all schedulers.
  readonly calls$: Observable<Call>;
  readonly callsSubscription: Subscription;

  #strategy: PhoneCanvassSchedulerStrategy;
  readonly phoneCanvassId: string;

  // From caller id.
  #callers = new Map<number, Caller>();
  #pendingContacts$: Observable<PhoneCanvassContactEntity>;

  getCurrentTime(): number {
    return Date.now();
  }

  get pendingContacts$(): Observable<PhoneCanvassContactEntity> {
    return this.#pendingContacts$;
  }

  constructor(
    strategy: PhoneCanvassSchedulerStrategy,
    public metricsTracker: PhoneCanvassMetricsTracker,
    params: {
      contacts: PhoneCanvassContactEntity[];
      phoneCanvassId: string;
      calls$: Observable<Call>;
    },
  ) {
    super();
    this.#strategy = strategy;
    this.phoneCanvassId = params.phoneCanvassId;
    this.calls$ = params.calls$;

    this.#pendingContacts$ = from(params.contacts).pipe(
      filter((contact) => !contact.beenCalled),
    );

    // TODO(mvp): handle when we run out of contacts.
    this.callsSubscription = zip(
      this.#strategy.nextCall$,
      this.#pendingContacts$,
    ).pipe(
      map((x) => x[1]),
      map((contact) => {
      return new Call("NOT_STARTED", {
        contact,
        phoneCanvassId: this.phoneCanvassId,
        emit: this.em,
      })
      }),
    );

    subscribe((call) => {
      const notStartedCall = ;
      this.callsByStatus.NOT_STARTED.set(notStartedCall.id, notStartedCall);
      this.#callsObservable.next(notStartedCall);
    });
  }

  stop(): void {
    this.callsSubscription.unsubscribe();
  }

  async waitForIdleForTest(): Promise<void> {
    // To be considered idle we either need no contacts remaining.
    if (this.#pendingContacts$.length === 0) {
      return;
    }
    // or all callers assigned to calls.
    await firstValueFrom(
      this.metricsTracker.idleCallerCountObservable.pipe(
        filter((v) => v === 0),
      ),
    );
  }

  getNextIdleCallerId(): number | undefined {
    const busyCallerIds = new Set(
      [...this.callsByStatus.IN_PROGRESS.values()].map((x) => x.callerId),
    );

    // Find the idle caller who has been available for the longest time.
    const availableCallers = [...this.#callers.values()].filter((caller) => {
      return !busyCallerIds.has(caller.id);
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
      availabilityStartTime: this.getCurrentTime(),
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
