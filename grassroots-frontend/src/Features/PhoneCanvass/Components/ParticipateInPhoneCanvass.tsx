import { JSX, useEffect, useRef } from "react";
import { MarkReadyForCallsButton } from "./MarkReadyForCallsButton.js";
import { usePhoneCanvassCallerStore } from "../Logic/PhoneCanvassCallerStore.js";
import { List, ListItem } from "@mantine/core";
import { ParticipateInPhoneCanvassRoute } from "../../../Routes/PhoneCanvass/$phoneCanvassId.js";
import { useStore } from "zustand";
import { createCallPartyStateStore } from "../Logic/CallPartyStateStore.js";
import { joinTwilioSyncGroup } from "../Logic/JoinTwilioSyncGroup.js";
import { useRegisterCaller } from "../Logic/UseRegisterCaller.js";

export function ParticipateInPhoneCanvass(): JSX.Element {
  const { phoneCanvassId } = ParticipateInPhoneCanvassRoute.useParams();

  const callPartyStateStoreRef = useRef(createCallPartyStateStore());
  const callPartyStateStore = useStore(callPartyStateStoreRef.current);
  const phoneCanvassCallerStore = usePhoneCanvassCallerStore();
  // TODO: this is required to force a rerender when the caller changes.
  // I think this means I put too much logic in the store.
  usePhoneCanvassCallerStore((state) => state.callerProps);

  const registerCaller = useRegisterCaller({
    phoneCanvassId,
    phoneCanvassCallerStore,
  });

  const { caller, refreshCaller } =
    ParticipateInPhoneCanvassRoute.useRouteContext();

  useEffect(() => {
    console.log("joining group with caller", caller);
    void joinTwilioSyncGroup({
      caller,
      callPartyStateStore,
      phoneCanvassCallerStore,
      registerCaller,
      refreshCaller,
    });
  }, []);

  console.log(callPartyStateStore);

  const contacts = callPartyStateStore.contacts.map((contact) => {
    const callDescription = ` status: ${contact.status}`;

    return (
      <ListItem key={contact.contactId}>
        {contact.contactDisplayName}
        {callDescription}
      </ListItem>
    );
  });
  const callers = callPartyStateStore.callers.map((caller) => {
    return (
      <ListItem key={caller.callerId}>
        {caller.displayName} {caller.ready ? "ready" : "not ready"}
      </ListItem>
    );
  });

  return (
    <>
      <h1> Call Party </h1>
      <h2> Welcome {caller.displayName}</h2>

      <>
        <MarkReadyForCallsButton caller={caller}></MarkReadyForCallsButton>
        <h2> Callers </h2>
        <List>{callers}</List>
        <h2> Contacts </h2>
        <List>{contacts}</List>
      </>
    </>
  );
}
