import { PhoneCanvassCallerDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { createStore, StoreApi } from "zustand";
import { devtools } from "zustand/middleware";

export interface PhoneCanvassCallerStore {
  caller?: PhoneCanvassCallerDTO;
  setCaller: (id: PhoneCanvassCallerDTO) => void;
}

export function createPhoneCanvassCallerStore(): StoreApi<PhoneCanvassCallerStore> {
  return createStore<PhoneCanvassCallerStore>()(
    devtools(
      (set) => {
        return {
          caller: undefined,
          setCaller: (caller: PhoneCanvassCallerDTO): void => {
            set({ caller });
          },
        };
      },
      {
        name: "phonecanvass-caller-store",
      },
    ),
  );
}
