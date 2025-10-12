import { PhoneCanvassParticipantIdentityDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { createStore, StoreApi } from "zustand";
import { devtools } from "zustand/middleware";

export interface PhoneCanvassIdentityStore {
  identity?: PhoneCanvassParticipantIdentityDTO;
  setParticipantIdentity: (id: PhoneCanvassParticipantIdentityDTO) => void;
}

export function createPhoneCanvassIdentityStore(): StoreApi<PhoneCanvassIdentityStore> {
  return createStore<PhoneCanvassIdentityStore>()(
    devtools(
      (set) => {
        return {
          identity: undefined,
          setParticipantIdentity: (
            id: PhoneCanvassParticipantIdentityDTO,
          ): void => {
            set({ identity: id });
          },
        };
      },
      {
        name: "phonecanvass-participant-store",
      },
    ),
  );
}
