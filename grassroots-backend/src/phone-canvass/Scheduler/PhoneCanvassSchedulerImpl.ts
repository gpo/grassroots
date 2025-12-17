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

  pendingCallerSummariesById = new Map<string, Caller>();
  #callers$: Observable<PhoneCanvassCallerDTO>;
  #pendingContacts$: Observable<PhoneCanvassContactEntity>;

  #getCurrentTime: () => number;

  constructor(
    strategy: PhoneCanvassSchedulerStrategy,
    // TODO: we shouldn't actually need a metricsTracker here.
    // It should probably live in the model.
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

    this.#callers$.subscribe({
      next: (caller) => {
        switch (caller.ready) {
          case "ready": {
            console.log("ADDING ", caller.id);
            this.pendingCallerSummariesById.set(caller.id, {
              id: caller.id,
              availabilityStartTime: this.#getCurrentTime(),
            });
            break;
          }
        }
      },
      error: (error: unknown) => {
        throw error;
      },
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
        filter((v) => v === 0),
      ),
    );
  }

  getNextIdleCallerId(): string | undefined {
    if (this.pendingCallerSummariesById.size === 0) {
      return undefined;
    }
    // Find the caller who has been available for the longest time.
    const oldestAvailableCaller = [
      ...this.pendingCallerSummariesById.values(),
    ].reduce((oldest: Caller, current: Caller) => {
      return oldest.availabilityStartTime < current.availabilityStartTime
        ? oldest
        : current;
    });

    console.log("REMOVING ", oldestAvailableCaller.id);
    this.pendingCallerSummariesById.delete(oldestAvailableCaller.id);

    return oldestAvailableCaller.id;
  }
}
