/* eslint-disable grassroots/entity-use */
import {
  CallResult,
  CallStatus,
} from "grassroots-shared/dtos/PhoneCanvass/CallStatus.dto";
import { PhoneCanvassContactEntity } from "../entities/PhoneCanvassContact.entity.js";
import { PhoneCanvassSchedulerImpl } from "./PhoneCanvassScheduler.js";

// Various failure modes can jump the status direct to "COMPLETED".
// Otherwise the status moves fairly linearly.
export const CALL_STATUS_VALID_TRANSITIONS = {
  NOT_STARTED: ["QUEUED", "INITIATED"],
  QUEUED: ["INITIATED"],
  INITIATED: ["RINGING", "COMPLETED"],
  RINGING: ["IN_PROGRESS", "COMPLETED"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
} as const satisfies Record<CallStatus, CallStatus[]>;

export type Call =
  | NotStartedCall
  | QueuedCall
  | InitiatedCall
  | RingingCall
  | InProgressCall
  | CompletedCall;

interface CommonCallState {
  id: number;
  scheduler: PhoneCanvassSchedulerImpl;
  contact: PhoneCanvassContactEntity;
  // Timestamps provided by Twilio when available.
  // Otherwise, we use Date.now().
  transitionTimestamps: Record<CallStatus, number | undefined>;
}

type CommonCallConstructorParams = CommonCallState & {
  currentTime: number;
};

export function resetPhoneCanvasCallIdsForTest(): void {
  NotStartedCall.resetIdsForTest();
}

abstract class AbstractCall<STATUS extends CallStatus> {
  readonly state: CommonCallState;

  constructor(params: CommonCallState) {
    this.state = params;
  }

  abstract get status(): STATUS;

  unregisterSelfFromScheduler(): void {
    if (
      !this.state.scheduler.callsByStatus[this.status].delete(this.state.id)
    ) {
      throw new Error(`Couldn't remove call with id ${String(this.state.id)}`);
    }
  }

  protected advanceStatusTo<
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
    T extends CallStatus,
    CallTypeTo extends Call & { status: T },
  >(call: CallTypeTo): CallTypeTo {
    this.unregisterSelfFromScheduler();

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
        NOT_STARTED: undefined,
        QUEUED: undefined,
        INITIATED: undefined,
        RINGING: undefined,
        IN_PROGRESS: undefined,
        COMPLETED: undefined,
      },
    });
    this.state.transitionTimestamps.NOT_STARTED = params.currentTime;
  }

  advanceStatusToInitiated(params: { currentTime: number }): InitiatedCall {
    return this.advanceStatusTo(
      new InitiatedCall({
        ...this.state,
        currentTime: params.currentTime,
      }),
    );
  }

  advanceStatusToQueued(params: { currentTime: number }): QueuedCall {
    return this.advanceStatusTo(
      new QueuedCall({
        ...this.state,
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

  constructor(params: CommonCallConstructorParams) {
    super(params);
    this.state.transitionTimestamps.QUEUED = params.currentTime;
  }

  advanceStatusToInitiated(params: { currentTime: number }): InitiatedCall {
    return this.advanceStatusTo(
      new InitiatedCall({
        ...this.state,
        currentTime: params.currentTime,
      }),
    );
  }
}

export class InitiatedCall extends AbstractCall<"INITIATED"> {
  status = "INITIATED" as const;

  constructor(params: CommonCallConstructorParams) {
    super(params);
    this.state.transitionTimestamps.INITIATED = params.currentTime;
  }

  advanceStatusToRinging(params: { currentTime: number }): RingingCall {
    return this.advanceStatusTo(
      new RingingCall({
        ...this.state,
        currentTime: params.currentTime,
      }),
    );
  }
}

export class RingingCall extends AbstractCall<"RINGING"> {
  status = "RINGING" as const;

  constructor(params: CommonCallConstructorParams) {
    super(params);
    this.state.transitionTimestamps.RINGING = params.currentTime;
  }

  advanceStatusToInProgress(params: {
    currentTime: number;
    callerId: number;
  }): InProgressCall {
    return this.advanceStatusTo(
      new InProgressCall({
        ...this.state,
        callerId: params.callerId,
        currentTime: params.currentTime,
      }),
    );
  }
}

export class InProgressCall extends AbstractCall<"IN_PROGRESS"> {
  status = "IN_PROGRESS" as const;
  #callerId: number;

  constructor(params: CommonCallConstructorParams & { callerId: number }) {
    super(params);
    this.#callerId = params.callerId;
    this.state.transitionTimestamps.IN_PROGRESS = params.currentTime;
  }

  get callerId(): number {
    return this.#callerId;
  }

  advanceStatusToCompleted(params: {
    result: CallResult;
    currentTime: number;
  }): CompletedCall {
    return this.advanceStatusTo(
      new CompletedCall({
        ...this.state,
        callerId: this.#callerId,
        currentTime: params.currentTime,
        result: params.result,
      }),
    );
  }
}

export class CompletedCall extends AbstractCall<"COMPLETED"> {
  status = "COMPLETED" as const;
  #result: CallResult;
  #callerId: number | undefined;

  constructor(
    params: CommonCallConstructorParams & {
      result: CallResult;
      callerId: number | undefined;
    },
  ) {
    super(params);
    this.#callerId = params.callerId;
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
