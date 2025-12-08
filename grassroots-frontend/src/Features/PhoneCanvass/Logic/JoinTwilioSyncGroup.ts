import { SyncClient, SyncDocument } from "twilio-sync";
import { CallPartyStateStore } from "./CallPartyStateStore.js";
import {
  CreatePhoneCanvassCallerDTO,
  PhoneCanvassCallerDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import {
  ContactSummary,
  PhoneCanvassSyncData,
} from "grassroots-shared/PhoneCanvass/PhoneCanvassSyncData";
import {
  getPhoneCanvassCaller,
  PhoneCanvassCallerStore,
  RefreshCaller,
} from "./PhoneCanvassCallerStore.js";
import { UseMutateAsyncFunction } from "@tanstack/react-query";
import { runPromise } from "grassroots-shared/util/RunPromise";

type RegisterCaller = UseMutateAsyncFunction<
  PhoneCanvassCallerDTO,
  Error,
  CreatePhoneCanvassCallerDTO
>;

interface JoinSyncGroupParams {
  caller: PhoneCanvassCallerDTO;
  callPartyStateStore: CallPartyStateStore;
  phoneCanvassCallerStore: PhoneCanvassCallerStore;
  registerCaller: RegisterCaller;
  refreshCaller: RefreshCaller;
  onNewContact: (contact: ContactSummary | undefined) => void;
  onReadyChanged: (ready: "ready" | "unready" | "last call") => void;
}

// We don't give anyone a handle to the SyncGroup, so they can't hold onto a stale instance.
class SyncGroupManager {
  #syncClient: SyncClient;
  #doc: SyncDocument | undefined;
  caller: PhoneCanvassCallerDTO;
  #callPartyStateStore: CallPartyStateStore;
  #phoneCanvassCallerStore: PhoneCanvassCallerStore;
  #registerCaller: RegisterCaller;
  #refreshCaller: RefreshCaller;
  #lastContact: ContactSummary | undefined;
  #lastCallerReady: "ready" | "unready" | "last call" | undefined;
  #currentRevision: string | undefined = undefined;
  #onNewContact: (contact: ContactSummary | undefined) => void;
  #onReadyChanged: (ready: "ready" | "unready" | "last call") => void;

  static instance: SyncGroupManager | undefined;

  constructor(params: JoinSyncGroupParams) {
    this.caller = params.caller;
    this.#syncClient = new SyncClient(this.caller.authToken);
    this.#callPartyStateStore = params.callPartyStateStore;
    this.#registerCaller = params.registerCaller;
    this.#refreshCaller = params.refreshCaller;
    this.#phoneCanvassCallerStore = params.phoneCanvassCallerStore;
    this.#onNewContact = params.onNewContact;
    this.#onReadyChanged = params.onReadyChanged;
    this.#lastCallerReady = undefined;
    this.#lastContact = undefined;
  }

  async #onUpdate(data: PhoneCanvassSyncData, revision: string): Promise<void> {
    if (revision === this.#currentRevision) {
      // Avoid repeated updates.
      return;
    }

    this.#currentRevision = revision;

    if (
      data.phoneCanvassId !=
      SyncGroupManager.instance?.caller.activePhoneCanvassId
    ) {
      // TODO: figure out why this keeps receiving onUpdates.
      return;
    }

    let caller = await getPhoneCanvassCaller({
      refreshCaller: this.#refreshCaller,
      activePhoneCanvassId: this.caller.activePhoneCanvassId,
      phoneCanvassCallerStore: this.#phoneCanvassCallerStore,
    });

    if (
      this.#callPartyStateStore.serverInstanceUUID &&
      this.#callPartyStateStore.serverInstanceUUID !==
        data.serverInstanceUUID &&
      caller
    ) {
      // The server has rebooted, we need to reregister.
      caller = await this.#registerCaller(
        CreatePhoneCanvassCallerDTO.from(caller),
      );
    }

    this.#callPartyStateStore.setData(data);
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
        // ACTIVELY DEBUGGING: why does this happen?
        // When we wipe the syncdata on server refresh, we end up with no information about the current
        // caller.
        throw new Error("We should know if the caller is ready");
      }
      this.#onReadyChanged(currentCallerReady);
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
        this.#onUpdate(doc.data as PhoneCanvassSyncData, doc.revision),
        false,
      );
    });

    this.#doc.on("updated", () => {
      runPromise(
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        this.#onUpdate(doc.data as PhoneCanvassSyncData, doc.revision),
        false,
      );
    });

    // This addresses a flaky bug where sometimes the sync data isn't initialized
    // on page visit.
    runPromise(
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      this.#onUpdate(this.#doc.data as PhoneCanvassSyncData, doc.revision),
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
    params.callPartyStateStore.reset();
    instance = undefined;
  }
  if (instance === undefined) {
    instance = new SyncGroupManager(params);
    await instance.init();
  }
  SyncGroupManager.instance = instance;
}
