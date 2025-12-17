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
import { EntityManager } from "@mikro-orm/core";
import { PhoneCanvassCallersModel } from "../PhoneCanvassCallers.model.js";

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
  contact: PhoneCanvassContactEntity;
}

// Can't use Partial<T> because of https://github.com/microsoft/TypeScript/issues/48587 .
interface UpdateableCallState {
  // Call SID, provided by twilio.
  twilioSid: string | undefined;
  playedVoicemail: boolean | undefined;
  answeredBy: AnsweredBy | undefined;
  result: CallResult | undefined;
  callerId: string | undefined;
  overrideAnsweredByMachine: boolean | undefined;
  overcalled: boolean | undefined;
}

const emptyUpdateableCallState: UpdateableCallState = {
  twilioSid: undefined,
  playedVoicemail: undefined,
  answeredBy: undefined,
  result: undefined,
  callerId: undefined,
  overrideAnsweredByMachine: undefined,
  overcalled: undefined,
};

export function resetPhoneCanvasCallIdsForTest(): void {
  Call.resetIdsForTest();
}

export class Call {
  static #currentId = 0;

  readonly state: Readonly<ImmutableCallState & UpdateableCallState>;
  #updated = false;
  status: CallStatus;

  constructor(
    status: CallStatus,
    // id should be missing if this is a new call, otherwise it should be present.
    params: Omit<ImmutableCallState, "id"> & { id?: number },
  ) {
    this.status = status;
    this.state = {
      ...emptyUpdateableCallState,
      ...params,
      id: params.id ?? ++Call.#currentId,
    };
    if (params.id === undefined) {
      this.state.emit(this);
    }
  }

  async log(phoneCanvassCallersModel: PhoneCanvassCallersModel): Promise<void> {
    const filteredValues: Record<string, unknown> = {};
    const extraFields = {
      callerEmail:
        this.state.callerId !== undefined
          ? phoneCanvassCallersModel.getCaller(this.state.callerId).email
          : undefined,
    };

    for (const [key, value] of Object.entries({
      ...this.state,
      ...extraFields,
    })) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      if ((value as unknown) === undefined || (value as unknown) === null) {
        continue;
      }
      if (
        value instanceof PhoneCanvassContactEntity ||
        value instanceof Function
      ) {
        continue;
      }
      filteredValues[key] = value;
    }
    const blob = {
      status: this.status,
      ...filteredValues,
      // TODO: pull the timestamp from twilio.
      ts: Date.now(),
    };
    await appendFile(
      `${LOG_DIR}/${this.canvassId}.log`,
      JSON.stringify(blob) + "\n",
    );
  }

  async updateContactIfNeeded(entityManager: EntityManager): Promise<void> {
    const contact = await entityManager.findOneOrFail(
      PhoneCanvassContactEntity,
      {
        phoneCanvassContactId: this.phoneCanvassContactId,
      },
    );
    const beenCalled =
      this.status === "RINGING" ||
      this.status === "IN_PROGRESS" ||
      this.status === "COMPLETED";

    let dirty = false;
    if (beenCalled !== contact.beenCalled) {
      dirty = true;
      contact.beenCalled = beenCalled;
    }

    if (this.status === "COMPLETED") {
      dirty = true;
      contact.callResult = this.result;
    }

    if (dirty) {
      await entityManager.flush();
    }
  }

  get phoneCanvassContactId(): number {
    return this.state.contact.phoneCanvassContactId;
  }

  get callerId(): string | undefined {
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

  update(status: CallStatus, props: Partial<UpdateableCallState>): Call {
    if (this.#updated) {
      throw new Error(
        `Calls should only be updated once. ${String(this.id)}, current status ${this.status}`,
      );
    }
    this.#updated = true;
    if (callStatusSort(this.status, status) > 0) {
      throw new Error(
        `Call status can't go backwards from ${this.status} to ${status} (id ${String(this.id)}/${String(this.phoneCanvassContactId)})`,
      );
    }
    for (const k of keys(props)) {
      if (this.state[k] != undefined && props[k] == undefined) {
        throw new Error("Can't unset call information");
      }
    }
    if (
      this.status === "COMPLETED" &&
      this.state.callerId === undefined &&
      props.callerId !== undefined
    ) {
      // Assigning a caller once a call is complete can create tricky race conditions.
      throw new Error(
        "We should never assign a caller once a call is complete.",
      );
    }
    const newCall = new Call(status, { ...this.state, ...props });
    newCall.state.emit(newCall);
    return newCall;
  }

  get id(): number {
    return this.state.id;
  }

  static resetIdsForTest(): void {
    this.#currentId = 0;
  }
}
