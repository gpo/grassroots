import { PhoneCanvassSyncData } from "grassroots-shared/PhoneCanvass/PhoneCanvassSyncData";
import { createStore, StoreApi } from "zustand";
import { devtools } from "zustand/middleware";

export interface CallPartyStateStore extends PhoneCanvassSyncData {
  setData: (data: PhoneCanvassSyncData | object) => void;
  reset: () => void;
}

const initialState = {
  callers: [],
  contacts: [],
  serverInstanceUUID: undefined,
  totalContacts: 0,
  doneContacts: 0,
};

export function createCallPartyStateStore(): StoreApi<CallPartyStateStore> {
  return createStore<CallPartyStateStore>()(
    devtools(
      (set) => ({
        ...initialState,
        // Data comes from twilio sync, which provides an untyped JSON blob.
        setData: (data: PhoneCanvassSyncData | object): void => {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          set(() => data as PhoneCanvassSyncData);
        },
        reset: (): void => {
          set(initialState);
        },
      }),
      {
        name: "phonecanvass-caller-store",
      },
    ),
  );
}
