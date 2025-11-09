import { PhoneCanvassCallerDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface PhoneCanvassCallerStore {
  caller?: PhoneCanvassCallerDTO;
  setCaller: (id: PhoneCanvassCallerDTO) => void;
}

export const usePhoneCanvassCallerStore = create<PhoneCanvassCallerStore>()(
  devtools(
    persist(
      (set) => {
        return {
          caller: undefined,
          setCaller: (caller: PhoneCanvassCallerDTO): void => {
            console.log("Set caller called with ", caller);
            set({ caller });
          },
        };
      },
      {
        name: "phonecanvass-caller-store",
      },
    ),
  ),
);
