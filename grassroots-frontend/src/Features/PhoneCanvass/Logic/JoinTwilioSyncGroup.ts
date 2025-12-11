import { SyncClient, SyncDocument } from "twilio-sync";
import { CallPartyStateStore } from "./CallPartyStateStore.js";
import {
  CreateOrUpdatePhoneCanvassCallerDTO,
  PhoneCanvassCallerDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import {
  ContactSummary,
  PhoneCanvassSyncData,
} from "grassroots-shared/PhoneCanvass/PhoneCanvassSyncData";
import {
  getPhoneCanvassCaller,
  PhoneCanvassCallerStore,
} from "./PhoneCanvassCallerStore.js";
import { UseMutateAsyncFunction } from "@tanstack/react-query";
import { runPromise } from "grassroots-shared/util/RunPromise";
import { StoreApi } from "zustand";

type CreateOrUpdateCallerMutation = UseMutateAsyncFunction<
  PhoneCanvassCallerDTO,
  Error,
  CreateOrUpdatePhoneCanvassCallerDTO
>;

interface JoinSyncGroupParams {
  caller: PhoneCanvassCallerDTO;
  callPartyStateStore: StoreApi<CallPartyStateStore>;
  phoneCanvassCallerStore: PhoneCanvassCallerStore;
  createOrUpdateCallerMutation: CreateOrUpdateCallerMutation;
  onNewContact: (contact: ContactSummary | undefined) => void;
  onReadyChanged: (ready: "ready" | "unready" | "last call") => void;
}

// We don't give anyone a handle to the SyncGroup, so they can't hold onto a stale instance.
class SyncGroupManager {
  #syncClient: SyncClient;
  #doc: SyncDocument | undefined;
  caller: PhoneCanvassCallerDTO;
  #callPartyStateStore: StoreApi<CallPartyStateStore>;
  #phoneCanvassCallerStore: PhoneCanvassCallerStore;
  #createOrUpdateCallerMutation: CreateOrUpdateCallerMutation;
  #lastContact: ContactSummary | undefined;
  #lastCallerReady: "ready" | "unready" | "last call" | undefined;
  #lastTimestamp = 0;
  #onNewContact: (contact: ContactSummary | undefined) => void;
  #onReadyChanged: (ready: "ready" | "unready" | "last call") => void;

  static instance: SyncGroupManager | undefined;

  constructor(params: JoinSyncGroupParams) {
    this.caller = params.caller;
    this.#syncClient = new SyncClient(this.caller.authToken);
    this.#callPartyStateStore = params.callPartyStateStore;
    this.#createOrUpdateCallerMutation = params.createOrUpdateCallerMutation;
    this.#phoneCanvassCallerStore = params.phoneCanvassCallerStore;
    this.#onNewContact = params.onNewContact;
    this.#onReadyChanged = params.onReadyChanged;
    this.#lastCallerReady = undefined;
    this.#lastContact = undefined;
  }

  async #onUpdate(data: PhoneCanvassSyncData): Promise<void> {
    const { timestamp } = data;
    const callPartyStateStore = this.#callPartyStateStore.getState();

    if (
      data.phoneCanvassId !=
      SyncGroupManager.instance?.caller.activePhoneCanvassId
    ) {
      // TODO: figure out why this keeps receiving onUpdates.
      // Has this gone away now that we prevent out of order messages?
      this.#lastTimestamp = 0;
      return;
    }

    if (this.#lastTimestamp >= timestamp) {
      // Avoid stale or repeated updates.
      return;
    }

    this.#lastTimestamp = timestamp;

    let caller = await getPhoneCanvassCaller({
      createOrUpdateCallerMutation: this.#createOrUpdateCallerMutation,
      activePhoneCanvassId: this.caller.activePhoneCanvassId,
      phoneCanvassCallerStore: this.#phoneCanvassCallerStore,
    });

    if (
      callPartyStateStore.serverInstanceUUID &&
      callPartyStateStore.serverInstanceUUID !== data.serverInstanceUUID &&
      caller
    ) {
      // The server has rebooted, we need to reregister.
      caller = await this.#createOrUpdateCallerMutation(
        CreateOrUpdatePhoneCanvassCallerDTO.from(caller),
      );
    }

    callPartyStateStore.setData(data);
    if (caller === undefined) {
      throw new Error("We should have a caller.");
    }
    const currentContact = data.contacts.find((x) => x.callerId == caller.id);
    if (this.#lastContact != currentContact) {
      this.#lastContact = currentContact;
      this.#onNewContact(currentContact);
    }

    const currentCallerReady = data.callers.find(
      (x) => x.callerId == caller.id,
    )?.ready;

    if (this.#lastCallerReady !== currentCallerReady) {
      this.#lastCallerReady = currentCallerReady;
      if (currentCallerReady === undefined) {
        // This can happen if the server restarts and we lose track of this caller.
        // Use "unready" until the caller resyncs.
        this.#onReadyChanged("unready");
      } else {
        this.#onReadyChanged(currentCallerReady);
      }
    }
  }

  async init(): Promise<void> {
    const doc = await this.#syncClient.document(
      this.caller.activePhoneCanvassId,
    );
    this.#doc = doc;
    this.#syncClient.on("connectionStateChanged", () => {
      runPromise(
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        this.#onUpdate(doc.data as PhoneCanvassSyncData),
        false,
      );
    });

    this.#doc.on("updated", () => {
      runPromise(
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        this.#onUpdate(doc.data as PhoneCanvassSyncData),
        false,
      );
    });

    // This addresses a flaky bug where sometimes the sync data isn't initialized
    // on page visit.
    runPromise(
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      this.#onUpdate(this.#doc.data as PhoneCanvassSyncData),
      false,
    );
  }

  async stop(): Promise<void> {
    await this.#syncClient.shutdown();
    if (!this.#doc) {
      throw new Error("Missing document, unable to unsubscribe.");
    }
    this.#doc.close();
  }
}

export async function joinTwilioSyncGroup(
  params: JoinSyncGroupParams,
): Promise<void> {
  let instance = SyncGroupManager.instance;

  if (
    instance !== undefined &&
    // We're trying to join a different sync group than the one we're currently in.
    // Leave the current group, and join the new one.
    !instance.caller.primaryPropsEqual(params.caller)
  ) {
    // Make sure no one can use the instance while things are shutting down.
    SyncGroupManager.instance = undefined;
    await instance.stop();
    params.callPartyStateStore.getState().reset();
    instance = undefined;
  }
  if (instance === undefined) {
    instance = new SyncGroupManager(params);
    await instance.init();
  }
  SyncGroupManager.instance = instance;
}
