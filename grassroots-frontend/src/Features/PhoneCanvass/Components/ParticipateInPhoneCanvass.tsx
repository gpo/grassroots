import { JSX, useCallback } from "react";
import { MarkReadyForCallsButton } from "./MarkReadyForCallsButton.js";
import { createPhoneCanvassIdentityStore } from "../Logic/PhoneCanvassIdentityStore.js";
import { List, ListItem, TextInput } from "@mantine/core";
import { useTypedForm } from "../../../Logic/UseTypedForm.js";
import { classValidatorResolver } from "../../../Logic/ClassValidatorResolver.js";
import { PhoneCanvassParticipantIdentityDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { ParticipateInPhoneCanvassRoute } from "../../../Routes/PhoneCanvass/$phoneCanvassId.js";
import { useStore } from "zustand";
import { useAddParticipant } from "../Logic/UseAddParticipant.js";
import { useAuthToken } from "../Logic/UseAuthToken.js";
import { createCallPartyStateStore } from "../Logic/CallPartyStateStore.js";

// TODO(MVP): replace with real ID.
const CALLEE_ID = 10;

export function ParticipateInPhoneCanvass(): JSX.Element {
  const { phoneCanvassId } = ParticipateInPhoneCanvassRoute.useParams();
  const phoneCanvassIdentityStore = useStore(createPhoneCanvassIdentityStore());
  const callPartyStateStore = useStore(createCallPartyStateStore());

  const authToken = useAuthToken(phoneCanvassId).data;

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

  // TODO(MVP): use a redirect here.
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

  const participants = callPartyStateStore.participants.map((x) => (
    <ListItem key={x.displayName}>
      {x.displayName} is {x.ready ? "ready" : "not ready"}
    </ListItem>
  ));
  const activeCalls = callPartyStateStore.activeCalls.map((x) => (
    <ListItem key={x.calleeId}>{x.calleeDisplayName}</ListItem>
  ));
  const pendingCalls = callPartyStateStore.pendingCalls.map((x) => (
    <ListItem key={x.calleeId}>{x.calleeDisplayName}</ListItem>
  ));

  return (
    <>
      <h1> Call Party </h1>
      <h2> Welcome {phoneCanvassIdentityStore.identity.displayName}</h2>
      {authToken === undefined ? (
        <h1>Logging in</h1>
      ) : (
        <>
          <MarkReadyForCallsButton
            authToken={authToken}
            identity={phoneCanvassIdentityStore.identity}
            calleeId={CALLEE_ID}
            callPartyStateStore={callPartyStateStore}
          ></MarkReadyForCallsButton>
          <h2> Participants </h2>
          <List>{participants}</List>
          <h2> Active Calls </h2>
          <List>{activeCalls}</List>
          <h2> Pending Calls </h2>
          <List>{pendingCalls}</List>
        </>
      )}
    </>
  );
}
