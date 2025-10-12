import { PhoneCanvassParticipantIdentityDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface PhoneCanvassParticipantState {
  identity: PhoneCanvassParticipantIdentityDTO | undefined;
  setParticipantIdentity: (id: PhoneCanvassParticipantIdentityDTO) => void;
}

export const usePhoneCanvassParticipantStore =
  create<PhoneCanvassParticipantState>()(
    devtools(
      persist(
        (set) => ({
          identity: undefined,
          setParticipantIdentity: (
            id: PhoneCanvassParticipantIdentityDTO,
          ): void => void set(() => ({ identity: id })),
        }),
        {
          name: "phonecanvass-participant-store",
        },
      ),
    ),
  );
