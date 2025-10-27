import { JSX, useCallback, useRef } from "react";
import { MarkReadyForCallsButton } from "./MarkReadyForCallsButton.js";
import { createPhoneCanvassCallerStore } from "../Logic/PhoneCanvassIdentityStore.js";
import { List, ListItem, TextInput } from "@mantine/core";
import { useTypedForm } from "../../../Logic/UseTypedForm.js";
import { classValidatorResolver } from "../../../Logic/ClassValidatorResolver.js";
import { CreatePhoneCanvassCallerDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { ParticipateInPhoneCanvassRoute } from "../../../Routes/PhoneCanvass/$phoneCanvassId.js";
import { useStore } from "zustand";
import { useAddCaller } from "../Logic/UseAddCaller.js";
import { useAuthToken } from "../Logic/UseAuthToken.js";
import { createCallPartyStateStore } from "../Logic/CallPartyStateStore.js";

// TODO(MVP): replace with real ID.
const CALLEE_ID = 10;

export function ParticipateInPhoneCanvass(): JSX.Element {
  const { phoneCanvassId } = ParticipateInPhoneCanvassRoute.useParams();
  const phoneCanvassIdentityStoreRef = useRef(createPhoneCanvassCallerStore());
  const phoneCanvassIdentityStore = useStore(
    phoneCanvassIdentityStoreRef.current,
    (s) => s,
  );

  const callPartyStateStoreRef = useRef(createCallPartyStateStore());
  const callPartyStateStore = useStore(callPartyStateStoreRef.current);

  const authToken = useAuthToken(phoneCanvassId).data;

  const identityForm = useTypedForm<CreatePhoneCanvassCallerDTO>({
    validate: classValidatorResolver(CreatePhoneCanvassCallerDTO),
    initialValues: CreatePhoneCanvassCallerDTO.from({
      displayName: "",
      email: "",
      activePhoneCanvassId: phoneCanvassId,
      ready: false,
    }),
  });

  const addCaller = useAddCaller({
    phoneCanvassId,
    phoneCanvassCallerStore: phoneCanvassIdentityStore,
  });

  const onSubmit = useCallback(async (data: CreatePhoneCanvassCallerDTO) => {
    await addCaller(data);
  }, []);

  // TODO(MVP): use a redirect here.
  if (
    phoneCanvassIdentityStore.caller === undefined ||
    phoneCanvassIdentityStore.caller.activePhoneCanvassId != phoneCanvassId
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

  const callers = callPartyStateStore.callers.map((x) => (
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
      <h2> Welcome {phoneCanvassIdentityStore.caller.displayName}</h2>
      {authToken === undefined ? (
        <h1>Logging in</h1>
      ) : (
        <>
          <MarkReadyForCallsButton
            authToken={authToken}
            identity={phoneCanvassIdentityStore.caller}
            calleeId={CALLEE_ID}
            callPartyStateStore={callPartyStateStore}
          ></MarkReadyForCallsButton>
          <h2> Participants </h2>
          <List>{callers}</List>
          <h2> Active Calls </h2>
          <List>{activeCalls}</List>
          <h2> Pending Calls </h2>
          <List>{pendingCalls}</List>
        </>
      )}
    </>
  );
}
