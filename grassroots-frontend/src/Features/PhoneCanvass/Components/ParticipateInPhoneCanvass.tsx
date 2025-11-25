import { JSX, useEffect, useRef, useState } from "react";
import { usePhoneCanvassCallerStore } from "../Logic/PhoneCanvassCallerStore.js";
import {
  Accordion,
  Box,
  Button,
  Group,
  Progress,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { ParticipateInPhoneCanvassRoute } from "../../../Routes/PhoneCanvass/$phoneCanvassId.js";
import { useStore } from "zustand";
import {
  CallPartyStateStore,
  createCallPartyStateStore,
} from "../Logic/CallPartyStateStore.js";
import { joinTwilioSyncGroup } from "../Logic/JoinTwilioSyncGroup.js";
import { useRegisterCaller } from "../Logic/UseRegisterCaller.js";
import { runPromise } from "grassroots-shared/util/RunPromise";
import { ContactSummary } from "grassroots-shared/PhoneCanvass/PhoneCanvassSyncData";
import { takeCall } from "../Logic/TakeCall.js";
import { markReadyForCalls, markLastCall } from "../Logic/MarkReadyForCalls.js";
import { Device } from "@twilio/voice-sdk";
import { usePhoneCanvassDetails } from "../Logic/UsePhoneCanvassDetails.js";
import { usePhoneCanvassContact } from "../Logic/UsePhoneCanvassContact.js";
import { ContactCard } from "../../Contacts/Components/ContactCard.js";
import { notifications } from "@mantine/notifications";
import { CallStatus } from "grassroots-shared/dtos/PhoneCanvass/CallStatus.dto";

const CALL_STATUS_EMOJIS: Record<CallStatus, string> = {
  NOT_STARTED: "💤",
  QUEUED: "⏱️",
  INITIATED: "⏱️",
  RINGING: "🔔",
  IN_PROGRESS: "📞",
  COMPLETED: "✅",
};

const CALLER_READY_EMOJIS: Record<"ready" | "unready" | "last call", string> = {
  ready: "🟢",
  unready: "🔴",
  "last call": "🟠",
};

function CallPartyProgress(props: {
  total: number;
  done: number;
}): JSX.Element {
  const { done, total } = props;
  return (
    <>
      <Group justify="space-between" mb="xs">
        <Text size="sm" c="dimmed">
          {done} / {total}
        </Text>
        <Text size="sm" c="dimmed">
          {Math.round(Math.round((done / total) * 100))}%
        </Text>
      </Group>

      <Progress value={(done / total) * 100} size="lg"></Progress>
    </>
  );
}

export function ParticipateInPhoneCanvass(): JSX.Element {
  const { phoneCanvassId } = ParticipateInPhoneCanvassRoute.useParams();

  const callPartyStateStoreRef = useRef(createCallPartyStateStore());
  const callPartyStateStore = useStore(callPartyStateStoreRef.current);
  const doneContacts = callPartyStateStore.doneContacts;
  console.log("DONE CONTACTS IS", doneContacts);
  const phoneCanvassCallerStore = usePhoneCanvassCallerStore();

  const [currentDevice, setCurrentDevice] = useState<Device | undefined>();
  const [currentContactId, setCurrentContactId] = useState<
    number | undefined
  >();
  const [readyForCalls, setReadyForCalls] = useState<
    "unready" | "ready" | "becomingReady" | "becomingUnready"
  >("unready");

  const registerCaller = useRegisterCaller({
    phoneCanvassId,
    phoneCanvassCallerStore,
  });

  // TODO: initialCaller's ready bit is often stale.
  const { refreshCaller, initialCaller } =
    ParticipateInPhoneCanvassRoute.useRouteContext();

  // If the user navigates away, we need to mark them as not ready.
  useEffect(() => {
    window.onbeforeunload = (event: BeforeUnloadEvent): string | undefined => {
      event.preventDefault();
      if (readyForCalls === "becomingReady" || readyForCalls === "ready") {
        setReadyForCalls("unready");
        runPromise(
          markLastCall({
            caller: initialCaller,
            device: currentDevice,
            keepalive: true,
          }),
          false,
        );
        notifications.show({
          title: "Marked as unready",
          message: "Marked as unready for additional calls",
          color: "red",
        });
      }
      if (currentContactId !== undefined) {
        return "You're in the middle of a call. Are you sure you want to leave?";
      }
    };
  }, [readyForCalls, currentContactId]);

  const currentContact = usePhoneCanvassContact(currentContactId).data;

  const currentContactDetails = currentContact ? (
    <Group>
      <ContactCard
        style={{ flex: "2 1 0" }}
        phoneCanvassContact={currentContact}
      ></ContactCard>
      <Box style={{ flex: "1 1 0" }}>
        <Text>TODO: notes go here.</Text>
      </Box>
    </Group>
  ) : null;

  const onNewContact = (contact: ContactSummary | undefined): void => {
    setCurrentContactId(contact?.contactId);
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
        caller: initialCaller,
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
    const callDescription = CALL_STATUS_EMOJIS[contact.status];

    return (
      <Table.Tr key={contact.contactId}>
        <Table.Td>{contact.contactDisplayName}</Table.Td>
        <Table.Td>{callDescription}</Table.Td>
      </Table.Tr>
    );
  });
  const callers = callPartyStateStore.callers.map((caller) => {
    return (
      <Table.Tr key={caller.callerId}>
        <Table.Td>{caller.displayName}</Table.Td>
        <Table.Td> {CALLER_READY_EMOJIS[caller.ready]}</Table.Td>
      </Table.Tr>
    );
  });

  const ToggleReadyButton = (): JSX.Element => {
    if (readyForCalls === "ready" || readyForCalls === "becomingUnready") {
      return (
        <Button
          disabled={readyForCalls === "becomingUnready"}
          onClick={() => {
            setReadyForCalls("becomingUnready");
            runPromise(
              (async (): Promise<void> => {
                await markLastCall({
                  caller: initialCaller,
                  device: currentDevice,
                });
                setReadyForCalls("unready");
              })(),
              false,
            );
          }}
        >
          Last Call For Now
        </Button>
      );
    } else {
      return (
        <Button
          disabled={readyForCalls === "becomingReady"}
          onClick={() => {
            setReadyForCalls("becomingReady");
            runPromise(
              (async (): Promise<void> => {
                const device = (
                  await markReadyForCalls({
                    caller: initialCaller,
                    device: currentDevice,
                  })
                ).device;
                setCurrentDevice(device);
                setReadyForCalls("ready");
              })(),
              false,
            );
          }}
        >
          Ready for Calls
        </Button>
      );
    }
  };

  return (
    <>
      <h1> Call Party: {phoneCanvassDetails?.name ?? ""} </h1>

      <Group align="start">
        <Stack style={{ flex: 1 }}>
          <h2> Welcome {initialCaller.displayName}</h2>
          <ToggleReadyButton></ToggleReadyButton>
          {currentContactDetails}
        </Stack>
        <Stack w={300}>
          <Accordion variant="contained">
            <Accordion.Item value={"Callers"}>
              <Accordion.Control>{`Callers (${String(callPartyStateStore.callers.length)})`}</Accordion.Control>
              <Accordion.Panel>
                <Table>
                  <Table.Tbody>{callers}</Table.Tbody>
                </Table>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>

          <Accordion variant="contained">
            <Accordion.Item value={"Callers"}>
              <Accordion.Control>
                <Text>{`Contacts`}</Text>
                <CallPartyProgress
                  total={callPartyStateStore.totalContacts}
                  done={callPartyStateStore.doneContacts}
                ></CallPartyProgress>
              </Accordion.Control>
              <Accordion.Panel>
                <Table>
                  <Table.Tbody>{contacts}</Table.Tbody>
                </Table>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Stack>
      </Group>
    </>
  );
}
