/* eslint-disable grassroots/entity-use */

import { filter, firstValueFrom, Observable, Subject } from "rxjs";
import { PhoneCanvassContactEntity } from "../entities/PhoneCanvassContact.entity.js";
import {
  InProgressCall as InProgressCall,
  CompletedCall,
  NotStartedCall,
  RingingCall as RingingCall,
  InitiatedCall,
} from "./PhoneCanvassCall.js";
import { PhoneCanvassMetricsTracker as PhoneCanvassMetricsTracker } from "./PhoneCanvassMetricsTracker.js";
import { PhoneCanvassSchedulerStrategy } from "./Strategies/PhoneCanvassSchedulerStrategy.js";
import { NoOvercallingStrategy } from "./Strategies/NoOvercallingStrategy.js";
import { CallStatus } from "grassroots-shared/dtos/PhoneCanvass/CallStatus.dto";
import { Injectable } from "@nestjs/common";

export interface Caller {
  id: number;
  availabilityStartTime: number /* Relative to Date.now()*/;
}

export interface PhoneCanvassScheduler {
  readonly calls: Observable<NotStartedCall>;
  start(): Promise<void>;
  stop(): void;
  addCaller(id: number): void;
  removeCaller(id: number): void;
  waitForIdleForTest(): Promise<void>;
  getNextIdleCallerId(): number | undefined;
  get metricsTracker(): PhoneCanvassMetricsTracker;
  get callsByStatus(): PhoneCanvassSchedulerCallsByStatus;
}

type PhoneCanvassSchedulerCallsByStatus = InstanceType<
  typeof PhoneCanvassSchedulerImpl
>["callsByStatus"];

@Injectable()
export class PhoneCanvassSchedulerImpl implements PhoneCanvassScheduler {
  #callsObservable = new Subject<NotStartedCall>();
  // Clients subscribe to this list of calls which need to be placed.
  readonly calls = this.#callsObservable.asObservable();

  #strategy: PhoneCanvassSchedulerStrategy;

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
  #pendingContacts: PhoneCanvassContactEntity[];

  metricsTracker: PhoneCanvassMetricsTracker;

  getCurrentTime(): number {
    return Date.now();
  }

  constructor(
    strategy: NoOvercallingStrategy,
    contacts: PhoneCanvassContactEntity[],
  ) {
    this.#pendingContacts = contacts.filter((contact) => {
      return contact.callStatus === "NOT_STARTED";
    });
    this.metricsTracker = new PhoneCanvassMetricsTracker();
    this.#strategy = strategy;
  }

  async start(): Promise<void> {
    if (this.#running) {
      throw new Error("Call to startScheduler when scheduler already running.");
    }
    this.#running = true;
    while (true) {
      await this.#strategy.waitForNextCall();
      // This could change while waiting for the next call.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!this.#running) {
        break;
      }

      const contact = this.#pendingContacts.shift();
      if (contact === undefined) {
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
