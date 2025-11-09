import { PhoneCanvassSyncData } from "grassroots-shared/PhoneCanvass/PhoneCanvassSyncData";
import { createStore, StoreApi } from "zustand";
import { devtools } from "zustand/middleware";

export interface CallPartyStateStore extends PhoneCanvassSyncData {
  setData: (data: PhoneCanvassSyncData | object) => void;
}

export function createCallPartyStateStore(): StoreApi<CallPartyStateStore> {
  return createStore<CallPartyStateStore>()(
    devtools(
      (set) => ({
        callers: [],
        contacts: [],
        serverInstanceUUID: undefined,
        // Data comes from twilio sync, which provides an untyped JSON blob.
        setData: (data: PhoneCanvassSyncData | object): void => {
          console.log("Sync data in setData", data);
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          set(() => data as PhoneCanvassSyncData);
        },
      }),
      {
        name: "phonecanvass-caller-store",
      },
    ),
  );
}
