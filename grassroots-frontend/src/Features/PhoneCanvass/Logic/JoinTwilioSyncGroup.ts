import { SyncClient, SyncDocument } from "twilio-sync";
import { CallPartyStateStore } from "./CallPartyStateStore.js";
import {
  CreatePhoneCanvassCallerDTO,
  PhoneCanvassCallerDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { PhoneCanvassSyncData } from "grassroots-shared/PhoneCanvass/PhoneCanvassSyncData";
import {
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

  static instance: SyncGroupManager | undefined;

  constructor(params: JoinSyncGroupParams) {
    this.caller = params.caller;
    console.log("Creating sync client with caller", this.caller);
    this.#syncClient = new SyncClient(this.caller.authToken);
    console.log("AFTER CREATING CLIENT");
    this.#callPartyStateStore = params.callPartyStateStore;
    this.#registerCaller = params.registerCaller;
    this.#refreshCaller = params.refreshCaller;
    this.#phoneCanvassCallerStore = params.phoneCanvassCallerStore;
  }

  async #onUpdate(data: PhoneCanvassSyncData): Promise<void> {
    if (
      data.phoneCanvassId !=
      SyncGroupManager.instance?.caller.activePhoneCanvassId
    ) {
      throw new Error("FOO");
    }
    const caller = await this.#phoneCanvassCallerStore.getCaller(
      this.#refreshCaller,
      this.caller.activePhoneCanvassId,
    );
    if (
      this.#callPartyStateStore.serverInstanceUUID &&
      this.#callPartyStateStore.serverInstanceUUID !==
        data.serverInstanceUUID &&
      caller
    ) {
      // The server has rebooted, we need to reregister.
      await this.#registerCaller(CreatePhoneCanvassCallerDTO.from(caller));
    }
    this.#callPartyStateStore.setData(data);
  }

  async init(): Promise<void> {
    console.log("GET DOC");
    const doc = await this.#syncClient.document(
      this.caller.activePhoneCanvassId,
    );
    this.#doc = doc;
    console.log("AFTER GET DOC");

    this.#syncClient.on("connectionStateChanged", () => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      runPromise(this.#onUpdate(doc.data as PhoneCanvassSyncData));
    });

    this.#doc.on("updated", () => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      runPromise(this.#onUpdate(doc.data as PhoneCanvassSyncData));
    });
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
    console.log("LEAVE CURRENT GROUP");
    // Make sure no one can use the instance while things are shutting down.
    SyncGroupManager.instance = undefined;
    await instance.stop();
    params.callPartyStateStore.reset();
    instance = undefined;
  }
  if (instance === undefined) {
    console.log("CREATE NEW INSTANCE");
    instance = new SyncGroupManager(params);
    await instance.init();
  }
  SyncGroupManager.instance = instance;
}
