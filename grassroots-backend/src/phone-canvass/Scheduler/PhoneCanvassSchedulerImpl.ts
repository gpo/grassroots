/* eslint-disable grassroots/entity-use */
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { CallStatus } from "grassroots-shared/dtos/PhoneCanvass/CallStatus.dto";
import { Subject, firstValueFrom, filter } from "rxjs";
import { PhoneCanvassContactEntity } from "../entities/PhoneCanvassContact.entity.js";
import {
  NotStartedCall,
  RingingCall,
  InitiatedCall,
  InProgressCall,
  CompletedCall,
} from "./PhoneCanvassCall.js";
import { PhoneCanvassMetricsTracker } from "./PhoneCanvassMetricsTracker.js";
import { Caller, PhoneCanvassScheduler } from "./PhoneCanvassScheduler.js";
import { PhoneCanvassSchedulerStrategy } from "./Strategies/PhoneCanvassSchedulerStrategy.js";

@Injectable()
export class PhoneCanvassSchedulerImpl extends PhoneCanvassScheduler {
  #callsObservable = new Subject<NotStartedCall>();
  // Clients subscribe to this list of calls which need to be placed.
  readonly calls = this.#callsObservable.asObservable();

  #strategy: PhoneCanvassSchedulerStrategy;
  readonly phoneCanvassId: string;

  callsByStatus = {
    NOT_STARTED: new Map<number, NotStartedCall>(),
    QUEUED: new Map<number, RingingCall>(),
    INITIATED: new Map<number, InitiatedCall>(),
    RINGING: new Map<number, RingingCall>(),
    IN_PROGRESS: new Map<number, InProgressCall>(),
    COMPLETED: new Map<number, CompletedCall>(),
  } as const satisfies Record<CallStatus, unknown>;
  // From caller id.
  #callers = new Map<number, Caller>();

  #running = false;
  #pendingContacts: PhoneCanvassContactEntity[] = [];

  getCurrentTime(): number {
    return Date.now();
  }

  constructor(
    @Inject(forwardRef(() => PhoneCanvassSchedulerStrategy))
    strategy: PhoneCanvassSchedulerStrategy,
    public metricsTracker: PhoneCanvassMetricsTracker,
    params: { contacts: PhoneCanvassContactEntity[]; phoneCanvassId: string },
  ) {
    super();
    this.#strategy = strategy;
    this.phoneCanvassId = params.phoneCanvassId;

    this.#pendingContacts = params.contacts.filter((contact) => {
      return contact.callStatus === "NOT_STARTED";
    });
  }

  startIfNeeded(): { started: boolean } {
    console.log("STARTING SCHEDULER");
    if (this.#running) {
      return { started: false };
    }
    this.#running = true;
    void (async (): Promise<void> => {
      while (true) {
        console.log("WAITING FOR NEXT CALL");
        await this.#strategy.waitForNextCall();
        console.log("GOT A CALL");
        // This could change while waiting for the next call.
        if (!this.#running) {
          console.log("NOT RUNNING");
          break;
        }

        const contact = this.#pendingContacts.shift();
        if (contact === undefined) {
          console.log("OUT OF CONTACTS");
          // We've called all contacts. We're done!
          this.#callsObservable.complete();
          break;
        }

        const notStartedCall = new NotStartedCall({
          scheduler: this,
          currentTime: this.getCurrentTime(),
          contact,
        });
        this.callsByStatus.NOT_STARTED.set(notStartedCall.id, notStartedCall);
        this.#callsObservable.next(notStartedCall);
        this.metricsTracker.onCallsByStatusUpdate(this.callsByStatus);
      }
    })();
    return { started: true };
  }

  stop(): void {
    this.#running = false;
  }

  async waitForIdleForTest(): Promise<void> {
    // To be considered idle we either need no contacts remaining.
    if (this.#pendingContacts.length === 0) {
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
      throw new Error("Tried to remove caller who wasn't present.");
    }
    this.metricsTracker.onCallerCountUpdate(this.#callers.size);
  }
}
