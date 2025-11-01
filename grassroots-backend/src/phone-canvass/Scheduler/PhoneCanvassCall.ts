/* eslint-disable grassroots/entity-use */
import {
  CallResult,
  CallStatus,
} from "grassroots-shared/dtos/PhoneCanvass/CallStatus.dto";
import { PhoneCanvassContactEntity } from "../entities/PhoneCanvassContact.entity.js";
import { PhoneCanvassScheduler } from "./PhoneCanvassScheduler.js";

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
  contact: PhoneCanvassContactEntity;
  // Timestamps provided by Twilio when available.
  // Otherwise, we use Date.now().
  transitionTimestamps: Record<CallStatus, number | undefined>;
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

abstract class AbstractCall<STATUS extends CallStatus> {
  readonly state: CommonCallState;

  constructor(params: CommonCallState) {
    this.state = params;
  }

  abstract get status(): STATUS;

  contactId(): number {
    return this.state.contact.id;
  }

  canvassId(): string {
    return this.state.scheduler.phoneCanvassId;
  }

  protected advanceStatusTo<CallTypeTo extends Call>(
    call: CallTypeTo,
  ): CallTypeTo {
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

  advanceStatusToQueued(params: CurrentTime & SID): QueuedCall {
    return this.advanceStatusTo(
      new QueuedCall({
        ...this.state,
        twilioSid: params.twilioSid,
        currentTime: params.currentTime,
      }),
    );
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

  advanceStatusToInitiated(params: CurrentTime): InitiatedCall {
    return this.advanceStatusTo(
      new InitiatedCall({
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

  advanceStatusToRinging(params: { currentTime: number }): RingingCall {
    console.log("Initiated call has status ", this.status);
    return this.advanceStatusTo(
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

  advanceStatusToInProgress(params: CurrentTime & CallerId): InProgressCall {
    return this.advanceStatusTo(
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
  #callerId: number;
  readonly twilioSid: string;

  constructor(params: CommonCallConstructorParams & CallerId & SID) {
    super(params);
    this.#callerId = params.callerId;
    this.state.transitionTimestamps.IN_PROGRESS = params.currentTime;
    this.twilioSid = params.twilioSid;
  }

  get callerId(): number {
    return this.#callerId;
  }

  advanceStatusToCompleted(
    params: {
      result: CallResult;
    } & CurrentTime,
  ): CompletedCall {
    return this.advanceStatusTo(
      new CompletedCall({
        ...this.state,
        callerId: this.#callerId,
        currentTime: params.currentTime,
        twilioSid: this.twilioSid,
        result: params.result,
      }),
    );
  }
}

export class CompletedCall extends AbstractCall<"COMPLETED"> {
  status = "COMPLETED" as const;
  #result: CallResult;
  #callerId: number | undefined;
  readonly twilioSid: string;

  constructor(
    params: CommonCallConstructorParams & {
      result: CallResult;
      callerId: number | undefined;
    } & CallerId &
      SID,
  ) {
    super(params);
    this.#callerId = params.callerId;
    this.twilioSid = params.twilioSid;
    this.state.transitionTimestamps.COMPLETED = params.currentTime;
    this.#result = params.result;
    this.state.scheduler.metricsTracker.onEndingCall(this);
  }

  get result(): CallResult {
    return this.#result;
  }

  get callerId(): number | undefined {
    return this.#callerId;
  }
}
