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
        participants: [],
        activeCalls: [],
        pendingCalls: [],
        // Data comes from twilio sync, which provides an untyped JSON blob.
        setData: (data: PhoneCanvassSyncData | object): void => {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          set(() => data as PhoneCanvassSyncData);
        },
      }),
      {
        name: "phonecanvass-participant-store",
      },
    ),
  );
}
