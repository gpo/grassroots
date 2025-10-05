import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { ParticipantIdentity } from "grassroots-shared/PhoneCanvass/ParticipantIdentity";

interface PhoneCanvassParticipantState {
  identity: ParticipantIdentity | undefined;
  setParticipantIdentity: (id: ParticipantIdentity) => void;
}

export const usePhoneCanvassParticipantStore =
  create<PhoneCanvassParticipantState>()(
    devtools(
      persist(
        (set) => ({
          identity: undefined,
          setParticipantIdentity: (id: ParticipantIdentity): void =>
            void set(() => ({ identity: id })),
        }),
        {
          name: "phonecanvass-participant-store",
        },
      ),
    ),
  );
