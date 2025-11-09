import { JSX, useEffect, useRef } from "react";
import { MarkReadyForCallsButton } from "./MarkReadyForCallsButton.js";
import { usePhoneCanvassCallerStore } from "../Logic/PhoneCanvassCallerStore.js";
import { List, ListItem } from "@mantine/core";
import { ParticipateInPhoneCanvassRoute } from "../../../Routes/PhoneCanvass/$phoneCanvassId.js";
import { useStore } from "zustand";
import { createCallPartyStateStore } from "../Logic/CallPartyStateStore.js";
import { SyncGroupManager } from "../Logic/SyncGroupManager.js";
import { useRegisterCaller } from "../Logic/UseRegisterCaller.js";

export function ParticipateInPhoneCanvass(): JSX.Element {
  const { phoneCanvassId } = ParticipateInPhoneCanvassRoute.useParams();

  const callPartyStateStoreRef = useRef(createCallPartyStateStore());
  const callPartyStateStore = useStore(callPartyStateStoreRef.current);
  const phoneCanvassCallerStore = usePhoneCanvassCallerStore();

  const registerCaller = useRegisterCaller({
    phoneCanvassId,
    phoneCanvassCallerStore,
  });

  // The route beforeLoad guard should prevent this from happening.
  if (phoneCanvassCallerStore.caller === undefined) {
    throw new Error("Missing caller");
  }

  useEffect(() => {
    // The route beforeLoad guard should prevent this from happening.
    if (phoneCanvassCallerStore.caller === undefined) {
      throw new Error("Missing caller");
    }
    console.log("joining group with caller", phoneCanvassCallerStore.caller);
    void SyncGroupManager.joinGroup({
      caller: phoneCanvassCallerStore.caller,
      callPartyStateStore,
      phoneCanvassCallerStore,
      registerCaller,
    });
  }, []);

  console.log(callPartyStateStore);

  const contacts = callPartyStateStore.contacts.map((contact) => {
    const callDescription = `status: ${contact.status}`;

    return (
      <ListItem key={contact.contactId}>
        {contact.contactDisplayName}
        {callDescription}
      </ListItem>
    );
  });
  const callers = callPartyStateStore.callers.map((caller) => {
    return <ListItem key={caller.callerId}>{caller.displayName}</ListItem>;
  });

  return (
    <>
      <h1> Call Party </h1>
      <h2> Welcome {phoneCanvassCallerStore.caller.displayName}</h2>

      <>
        <MarkReadyForCallsButton
          caller={phoneCanvassCallerStore.caller}
        ></MarkReadyForCallsButton>
        <h2> Callers </h2>
        <List>{callers}</List>
        <h2> Contacts </h2>
        <List>{contacts}</List>
      </>
    </>
  );
}
