/* eslint-disable grassroots/entity-use */
import {
  CallResult,
  CallStatus,
  callStatusSort,
} from "grassroots-shared/dtos/PhoneCanvass/CallStatus.dto";
import { PhoneCanvassContactEntity } from "../entities/PhoneCanvassContact.entity.js";
import { appendFile } from "fs/promises";
import { LOG_DIR } from "../PhoneCanvass.module.js";
import { keys } from "grassroots-shared/util/Keys";

export type AnsweredBy =
  | "machine_end_beep"
  | "machine_end_silence"
  | "machine_end_other"
  | "human"
  | "fax"
  | "unknown";

interface ImmutableCallState {
  // Unique ID which exists throughout call lifetime, including before the twilio call is created.
  id: number;
  phoneCanvassId: string;
  emit: (call: Call) => void;
  //scheduler: PhoneCanvassScheduler;
  /*onCallCompleteForCaller: (
    phoneCanvassId: string,
    callerId: number,
  ) => { becameUnready: boolean };*/
  contact: PhoneCanvassContactEntity;
}

export type MutableCallState = Partial<{
  // Call SID, provided by twilio.
  twilioSid: string;
  playedVoicemail: boolean;
  answeredBy: AnsweredBy;
  result: CallResult;
  callerId: number;
}>;

type CallState = ImmutableCallState & MutableCallState;

export function resetPhoneCanvasCallIdsForTest(): void {
  Call.resetIdsForTest();
}

export class Call {
  static #currentId = 0;

  readonly state: CallState & MutableCallState;
  status: CallStatus;

  constructor(status: CallStatus, params: Omit<ImmutableCallState, "id">) {
    this.status = status;
    this.state = { ...params, id: ++Call.#currentId };
    console.log("EMITTING FROM CONSTRUCTOR");
    this.state.emit(this);
  }

  async log(): Promise<void> {
    const undefinedRemoved: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(this.state)) {
      if (value !== undefined) {
        undefinedRemoved[key] = value;
      }
    }
    const blob = {
      status: this.status,
      ...undefinedRemoved,
      // TODO: pull the timestamp from twilio.
      ts: Date.now(),
    };
    await appendFile(
      `${LOG_DIR}/${this.canvassId}.log`,
      JSON.stringify(blob) + "\n",
    );
  }

  get phoneCanvassContactId(): number {
    return this.state.contact.phoneCanvassContactId;
  }

  get callerId(): number | undefined {
    return this.state.callerId;
  }

  get result(): CallResult | undefined {
    return this.state.result;
  }

  get canvassId(): string {
    return this.state.phoneCanvassId;
  }

  get twilioSid(): string | undefined {
    return this.state.twilioSid;
  }

  update(status: CallStatus, props: MutableCallState): this {
    if (callStatusSort(this.status, status) > 0) {
      throw new Error(
        `Call status can't go backwards from ${this.status} to ${status}`,
      );
    }
    for (const k of keys(props)) {
      if (this.state[k] != undefined && props[k] == undefined) {
        throw new Error("Can't unset call information");
      }
    }
    this.status = status;
    Object.assign(this.state, props);
    console.log("EMITTING");
    this.state.emit(this);
    return this;
    /*
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
      Call
    >;
    calls.set(call.state.id, call);

    // Contacts were grabbed during another request, so they will have detached.
    // Push them into this entityManager again, or the flush below does nothing.
    this.state.entityManager.merge(call.state.contact);

    call.state.contact.callStatus = call.status;
    if (call.status === "COMPLETED") {
      call.state.contact.callResult = call.state.result;
      if (call.callerId !== undefined) {
        const becameUnready = this.state.onCallCompleteForCaller(
          call.canvassId,
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
    );*/
  }

  get id(): number {
    return this.state.id;
  }

  static resetIdsForTest(): void {
    this.#currentId = 0;
  }
}
