import { JSX, useCallback } from "react";
import { StartCall } from "./StartCall.js";
import { createPhoneCanvassIdentityStore } from "../Logic/PhoneCanvassIdentityStore.js";
import { TextInput } from "@mantine/core";
import { useTypedForm } from "../../../Logic/UseTypedForm.js";
import { classValidatorResolver } from "../../../Logic/ClassValidatorResolver.js";
import { PhoneCanvassParticipantIdentityDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { ParticipateInPhoneCanvassRoute } from "../../../Routes/PhoneCanvass/$phoneCanvassId.js";
import { useStore } from "zustand";
import { useAddParticipant } from "../Logic/UseAddParticipant.js";
import { useAuthToken } from "../Logic/UseAuthToken.js";

// TODO: replace with real ID.
const CALLEE_ID = 10;

export function ParticipateInPhoneCanvass(): JSX.Element {
  const { phoneCanvassId } = ParticipateInPhoneCanvassRoute.useParams();
  const phoneCanvassIdentityStore = useStore(createPhoneCanvassIdentityStore());
  const authToken = useAuthToken(phoneCanvassId);

  const identityForm = useTypedForm<PhoneCanvassParticipantIdentityDTO>({
    validate: classValidatorResolver(PhoneCanvassParticipantIdentityDTO),
    initialValues: PhoneCanvassParticipantIdentityDTO.from({
      displayName: "",
      email: "",
      activePhoneCanvassId: phoneCanvassId,
      ready: false,
    }),
  });

  const addParticipant = useAddParticipant({
    phoneCanvassId,
    phoneCanvassIdentityStore,
  });

  const onSubmit = useCallback(
    async (data: PhoneCanvassParticipantIdentityDTO) => {
      await addParticipant(data);
    },
    [],
  );

  // TODO: use a redirect here.
  if (
    phoneCanvassIdentityStore.identity === undefined ||
    phoneCanvassIdentityStore.identity.activePhoneCanvassId != phoneCanvassId
  ) {
    return (
      <>
        <h1>Welcome to the Party</h1>
        <form onSubmit={identityForm.onSubmit(onSubmit)}>
          <TextInput
            label="Display Name"
            key={identityForm.key("displayName")}
            {...identityForm.getInputProps("displayName")}
          ></TextInput>
          <TextInput
            label="Email"
            key={identityForm.key("email")}
            {...identityForm.getInputProps("email")}
          ></TextInput>
          <input type="submit" />
        </form>
      </>
    );
  }

  return (
    <>
      <h1> Call Party </h1>
      <h2> Welcome {phoneCanvassIdentityStore.identity.displayName}</h2>
      <StartCall
        authToken={authToken}
        identity={phoneCanvassIdentityStore.identity}
        calleeId={CALLEE_ID}
      ></StartCall>
    </>
  );
}
