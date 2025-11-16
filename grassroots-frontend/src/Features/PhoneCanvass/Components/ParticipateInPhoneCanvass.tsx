import { JSX, useEffect, useRef, useState } from "react";
import { usePhoneCanvassCallerStore } from "../Logic/PhoneCanvassCallerStore.js";
import { Button, List, ListItem } from "@mantine/core";
import { ParticipateInPhoneCanvassRoute } from "../../../Routes/PhoneCanvass/$phoneCanvassId.js";
import { useStore } from "zustand";
import { createCallPartyStateStore } from "../Logic/CallPartyStateStore.js";
import { joinTwilioSyncGroup } from "../Logic/JoinTwilioSyncGroup.js";
import { useRegisterCaller } from "../Logic/UseRegisterCaller.js";
import { runPromise } from "grassroots-shared/util/RunPromise";
import { ContactSummary } from "grassroots-shared/PhoneCanvass/PhoneCanvassSyncData";
import { takeCall } from "../Logic/TakeCall.js";
import { markReadyForCalls } from "../Logic/MarkReadyForCalls.js";
import { Device } from "@twilio/voice-sdk";
import { usePhoneCanvassDetails } from "../Logic/UsePhoneCanvassDetails.js";
import { usePhoneCanvassContact } from "../Logic/UsePhoneCanvassContact.js";
import { PhoneCanvassContactCard } from "./PhoneCanvassContactCard.js";

export function ParticipateInPhoneCanvass(): JSX.Element {
  const { phoneCanvassId } = ParticipateInPhoneCanvassRoute.useParams();

  const callPartyStateStoreRef = useRef(createCallPartyStateStore());
  const callPartyStateStore = useStore(callPartyStateStoreRef.current);
  const phoneCanvassCallerStore = usePhoneCanvassCallerStore();
  const [currentDevice, setCurrentDevice] = useState<Device | undefined>();
  const [currentContactId, setCurrentContactId] = useState<
    number | undefined
  >();

  const registerCaller = useRegisterCaller({
    phoneCanvassId,
    phoneCanvassCallerStore,
  });

  const currentContact = usePhoneCanvassContact(currentContactId).data;

  console.log("CURRENT CONTACT", currentContact);
  const currentContactCard = currentContact ? (
    <PhoneCanvassContactCard
      phoneCanvassContact={currentContact}
    ></PhoneCanvassContactCard>
  ) : null;

  const { caller, refreshCaller } =
    ParticipateInPhoneCanvassRoute.useRouteContext();

  const onNewContact = (contact: ContactSummary): void => {
    setCurrentContactId(contact.contactId);
  };

  useEffect(() => {
    // Device is still initializing, or we haven't been matched with a contact.
    if (currentContactId === undefined || currentDevice === undefined) {
      return;
    }
    runPromise(takeCall(currentDevice, currentContactId), false);
  }, [currentContactId, currentDevice]);

  useEffect(() => {
    runPromise(
      joinTwilioSyncGroup({
        caller,
        callPartyStateStore,
        phoneCanvassCallerStore,
        registerCaller,
        refreshCaller,
        onNewContact,
      }),
      false,
    );
  }, []);

  const phoneCanvassDetails = usePhoneCanvassDetails(phoneCanvassId).data;

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
      <h1> Call Party: {phoneCanvassDetails?.name ?? ""} </h1>
      <h2> Welcome {caller.displayName}</h2>

      <>
        <Button
          onClick={() => {
            runPromise(
              (async (): Promise<void> => {
                const device = (await markReadyForCalls({ caller })).device;
                console.log("SETTING DEVICE", device);
                setCurrentDevice(device);
              })(),
              false,
            );
          }}
        >
          Ready for Calls
        </Button>
        {currentContactCard}
        <h2> Callers </h2>
        <List>{callers}</List>
        <h2> Contacts </h2>
        <List>{contacts}</List>
      </>
    </>
  );
}
