/* eslint-disable grassroots/entity-use */
import {
  CallResult,
  CallStatus,
} from "grassroots-shared/dtos/PhoneCanvass/CallStatus.dto";
import { PhoneCanvassContactEntity } from "../entities/PhoneCanvassContact.entity.js";
import { PhoneCanvassScheduler } from "./PhoneCanvassScheduler.js";
import { EntityManager } from "@mikro-orm/core";
import { runPromise } from "grassroots-shared/util/RunPromise";
import { appendFile } from "fs/promises";
import { delay } from "grassroots-shared/util/Delay";
import { LOG_DIR } from "../PhoneCanvass.module.js";

export type Call =
  | NotStartedCall
  | QueuedCall
  | InitiatedCall
  | RingingCall
  | InProgressCall
  | CompletedCall;

interface CommonCallState {
  // Unique ID which exists throughout call lifetime, including before the twilio call is created.
  id: number;
  scheduler: PhoneCanvassScheduler;
  onCallCompleteForCaller: (
    phoneCanvassId: string,
    callerId: number,
  ) => { becameUnready: boolean };
  contact: PhoneCanvassContactEntity;
  // Timestamps provided by Twilio when available.
  // Otherwise, we use Date.now().
  transitionTimestamps: Record<CallStatus, number | undefined>;
  entityManager: EntityManager;
}

type CommonCallConstructorParams = CommonCallState & {
  currentTime: number;
};

interface SID {
  // Call SID, provided by twilio.
  twilioSid: string;
}

interface CallerId {
  callerId: number;
}

interface CurrentTime {
  currentTime: number;
}

export function resetPhoneCanvasCallIdsForTest(): void {
  NotStartedCall.resetIdsForTest();
}

function getCallerId(call: Call): number | undefined {
  if (call.status === "IN_PROGRESS") {
    return call.callerId;
  }
}

abstract class AbstractCall<STATUS extends CallStatus> {
  readonly state: CommonCallState;

  constructor(params: CommonCallState) {
    this.state = params;

    runPromise(
      (async (): Promise<void> => {
        // Wait until this object is fully constructed.
        // TODO: this is a bit ugly.
        await delay(0);
        await this.log();
      })(),
      false,
    );
  }

  async log(): Promise<void> {
    const blob = {
      id: this.id,
      sid: "twilioSid" in this ? this.twilioSid : undefined,
      status: this.status,
      result: "result" in this ? this.result : undefined,
      playedVoicemail:
        "playedVoicemail" in this && this.playedVoicemail === true
          ? this.playedVoicemail
          : undefined,

      contactId: this.state.contact.contact.id,
      // TODO: pull the timestamp from twilio.
      ts: Date.now(),
    };
    await appendFile(
      `${LOG_DIR}/${this.canvassId()}.log`,
      JSON.stringify(blob) + "\n",
    );
  }

  abstract get status(): STATUS;

  contactId(): number {
    return this.state.contact.id;
  }

  canvassId(): string {
    return this.state.scheduler.phoneCanvassId;
  }

  public async advanceStatusToFailed(
    params: CurrentTime & SID & { result: CallResult },
  ): Promise<CompletedCall> {
    return await this.advanceStatusTo(
      new CompletedCall({
        ...params,
        ...this.state,
        // TODO: this is ugly. We should probably change this whole structure to a single interface
        // with multiple Interfaces over it, depending on state.
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        callerId: getCallerId(this as unknown as Call),
        playedVoicemail: false,
      }),
    );
  }

  protected async advanceStatusTo<CallTypeTo extends Call>(
    call: CallTypeTo,
  ): Promise<CallTypeTo> {
    if (
      !this.state.scheduler.callsByStatus[this.status].delete(this.state.id)
    ) {
      throw new Error(
        `Couldn't remove call with id ${String(this.state.id)} and status ${this.status}`,
      );
    }

    // Sadly typescript has a rough time deducing these types.
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const calls = this.state.scheduler.callsByStatus[call.status] as Map<
      number,
      CallTypeTo
    >;
    calls.set(call.state.id, call);

    // Contacts were grabbed during another request, so they will have detached.
    // Push them into this entityManager again, or the flush below does nothing.
    this.state.entityManager.merge(call.state.contact);

    call.state.contact.callStatus = call.status;
    if (call.status === "COMPLETED") {
      call.state.contact.callResult = call.result;
      if (call.callerId !== undefined) {
        const becameUnready = this.state.onCallCompleteForCaller(
          call.canvassId(),
          call.callerId,
        );
        if (becameUnready.becameUnready) {
          this.state.scheduler.removeCaller(call.callerId);
        }
      }
    }

    await this.state.entityManager.flush();

    this.state.scheduler.metricsTracker.onCallsByStatusUpdate(
      this.state.scheduler.callsByStatus,
    );

    return call;
  }

  get id(): number {
    return this.state.id;
  }
}

export class NotStartedCall extends AbstractCall<"NOT_STARTED"> {
  static #currentId = 0;
  readonly status = "NOT_STARTED" as const;

  constructor(
    params: Omit<CommonCallConstructorParams, "id" | "transitionTimestamps">,
  ) {
    super({
      ...params,
      id: ++NotStartedCall.#currentId,
      transitionTimestamps: {
        NOT_STARTED: params.currentTime,
        QUEUED: undefined,
        INITIATED: undefined,
        RINGING: undefined,
        IN_PROGRESS: undefined,
        COMPLETED: undefined,
      },
    });
  }

  // We split this from advancing the call to avoid a race where twilio sends a callback
  // before this is we've registered this call with the PhoneCanvassService.
  constructQueuedCall(params: CurrentTime & SID): QueuedCall {
    return new QueuedCall({
      ...this.state,
      twilioSid: params.twilioSid,
      currentTime: params.currentTime,
    });
  }

  async advanceStatusToQueued(call: QueuedCall): Promise<QueuedCall> {
    return await this.advanceStatusTo(call);
  }

  static resetIdsForTest(): void {
    NotStartedCall.#currentId = 0;
  }
}

export class QueuedCall extends AbstractCall<"QUEUED"> {
  status = "QUEUED" as const;
  readonly twilioSid: string;

  constructor(params: CommonCallConstructorParams & SID) {
    super(params);
    this.twilioSid = params.twilioSid;
    this.state.transitionTimestamps.QUEUED = params.currentTime;
  }

  async advanceStatusToInitiated(params: CurrentTime): Promise<InitiatedCall> {
    return await this.advanceStatusTo(
      new InitiatedCall({
        ...this.state,
        twilioSid: this.twilioSid,
        currentTime: params.currentTime,
      }),
    );
  }

  async advanceStatusToRinging(params: CurrentTime): Promise<RingingCall> {
    return await this.advanceStatusTo(
      new RingingCall({
        ...this.state,
        twilioSid: this.twilioSid,
        currentTime: params.currentTime,
      }),
    );
  }
}

export class InitiatedCall extends AbstractCall<"INITIATED"> {
  status = "INITIATED" as const;
  readonly twilioSid: string;

  constructor(params: CommonCallConstructorParams & SID) {
    super(params);
    this.twilioSid = params.twilioSid;
    this.state.transitionTimestamps.INITIATED = params.currentTime;
  }

  async advanceStatusToRinging(params: {
    currentTime: number;
  }): Promise<RingingCall> {
    return await this.advanceStatusTo(
      new RingingCall({
        ...this.state,
        twilioSid: this.twilioSid,
        currentTime: params.currentTime,
      }),
    );
  }
}

export class RingingCall extends AbstractCall<"RINGING"> {
  status = "RINGING" as const;
  readonly twilioSid: string;

  constructor(params: CommonCallConstructorParams & SID) {
    super(params);
    this.twilioSid = params.twilioSid;
    this.state.transitionTimestamps.RINGING = params.currentTime;
  }

  async advanceStatusToInProgress(
    params: CurrentTime & CallerId,
  ): Promise<InProgressCall> {
    return await this.advanceStatusTo(
      new InProgressCall({
        ...this.state,
        twilioSid: this.twilioSid,
        callerId: params.callerId,
        currentTime: params.currentTime,
      }),
    );
  }
}

export class InProgressCall extends AbstractCall<"IN_PROGRESS"> {
  status = "IN_PROGRESS" as const;
  #callerId: number | undefined;
  readonly twilioSid: string;

  constructor(params: CommonCallConstructorParams & CallerId & SID) {
    super(params);
    this.#callerId = params.callerId;
    this.state.transitionTimestamps.IN_PROGRESS = params.currentTime;
    this.twilioSid = params.twilioSid;
  }

  get callerId(): number | undefined {
    return this.#callerId;
  }

  async advanceStatusToCompleted(
    params: {
      result: CallResult;
      playedVoicemail: boolean;
    } & CurrentTime,
  ): Promise<CompletedCall> {
    return await this.advanceStatusTo(
      new CompletedCall({
        ...this.state,
        callerId: this.#callerId,
        currentTime: params.currentTime,
        twilioSid: this.twilioSid,
        result: params.result,
        playedVoicemail: params.playedVoicemail,
      }),
    );
  }
}

export class CompletedCall extends AbstractCall<"COMPLETED"> {
  status = "COMPLETED" as const;
  #result: CallResult;
  #callerId: number | undefined;
  readonly playedVoicemail: boolean;
  readonly twilioSid: string;

  constructor(
    params: CommonCallConstructorParams & {
      result: CallResult;
      callerId: number | undefined;
      playedVoicemail: boolean;
    } & SID,
  ) {
    super(params);
    this.#callerId = params.callerId;
    this.twilioSid = params.twilioSid;
    this.state.transitionTimestamps.COMPLETED = params.currentTime;
    this.#result = params.result;
    this.state.scheduler.metricsTracker.onEndingCall(this);
    this.playedVoicemail = params.playedVoicemail;
  }

  get result(): CallResult {
    return this.#result;
  }

  get callerId(): number | undefined {
    return this.#callerId;
  }
}
