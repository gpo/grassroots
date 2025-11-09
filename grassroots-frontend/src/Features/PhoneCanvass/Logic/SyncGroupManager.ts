import { SyncClient } from "twilio-sync";
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

export class SyncGroupManager {
  #syncClient: SyncClient;
  #caller: PhoneCanvassCallerDTO;
  #callPartyStateStore: CallPartyStateStore;
  #phoneCanvassCallerStore: PhoneCanvassCallerStore;
  #registerCaller: RegisterCaller;
  #refreshCaller: RefreshCaller;

  static #instance: SyncGroupManager | undefined;
  static async joinGroup(
    params: JoinSyncGroupParams,
  ): Promise<SyncGroupManager> {
    let instance = SyncGroupManager.#instance;
    if (instance !== undefined) {
      console.log("CALLER IS", instance.#caller);
    }

    if (
      instance !== undefined &&
      // We're trying to join a different sync group than the one we're currently in.
      // Leave the current group, and join the new one.
      !instance.#caller.primaryPropsEqual(params.caller)
    ) {
      console.log("LEAVE CURRENT GROUP");
      await instance.#stop();
      params.callPartyStateStore.reset();
      instance = undefined;
    }
    if (instance === undefined) {
      console.log("CREATE NEW INSTANCE");
      instance = new SyncGroupManager(params);
      await instance.#init();
    }
    SyncGroupManager.#instance = instance;
    return instance;
  }
  private constructor(params: JoinSyncGroupParams) {
    this.#caller = params.caller;
    console.log("Creating sync client with caller", this.#caller);
    this.#syncClient = new SyncClient(this.#caller.authToken);
    console.log("AFTER CREATING CLIENT");
    this.#callPartyStateStore = params.callPartyStateStore;
    this.#registerCaller = params.registerCaller;
    this.#refreshCaller = params.refreshCaller;
    this.#phoneCanvassCallerStore = params.phoneCanvassCallerStore;
  }

  async #onUpdate(data: PhoneCanvassSyncData): Promise<void> {
    const caller = await this.#phoneCanvassCallerStore.getCaller(
      this.#refreshCaller,
      this.#caller.activePhoneCanvassId,
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

  async #init(): Promise<void> {
    console.log("GET DOC");
    const doc = await this.#syncClient.document(
      this.#caller.activePhoneCanvassId,
    );
    console.log("AFTER GET DOC");

    this.#syncClient.on("connectionStateChanged", () => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      void this.#onUpdate(doc.data as PhoneCanvassSyncData);
    });

    doc.on("updated", () => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      void this.#onUpdate(doc.data as PhoneCanvassSyncData);
    });
  }

  async #stop(): Promise<void> {
    await this.#syncClient.shutdown();
  }
}
