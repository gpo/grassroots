import { JSX, useEffect, useRef, useState } from "react";
import {
  usePhoneCanvassCaller,
  usePhoneCanvassCallerStore,
} from "../Logic/PhoneCanvassCallerStore.js";
import {
  Accordion,
  Box,
  Button,
  Group,
  Progress,
  Stack,
  Table,
  Text,
  Title,
  Image,
  Paper,
  Center,
} from "@mantine/core";
import { ParticipateInPhoneCanvassRoute } from "../../../Routes/PhoneCanvass/$phoneCanvassId.js";
import { useStore } from "zustand";
import { createCallPartyStateStore } from "../Logic/CallPartyStateStore.js";
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
import { useUpdateCaller } from "../Logic/UseUpdateCaller.js";

const CALL_STATUS_EMOJIS: Record<CallStatus, string> = {
  NOT_STARTED: " ",
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

  const updateCallerKeepAlive = useUpdateCaller({
    phoneCanvassId,
    phoneCanvassCallerStore,
    keepAlive: true,
  });

  const updateCallerNoKeepAlive = useUpdateCaller({
    phoneCanvassId,
    phoneCanvassCallerStore,
    keepAlive: false,
  });

  const { refreshCaller, initialCaller } =
    ParticipateInPhoneCanvassRoute.useRouteContext();

  const caller =
    usePhoneCanvassCaller({
      refreshCaller,
      activePhoneCanvassId: phoneCanvassId,
      phoneCanvassCallerStore,
    }) ?? initialCaller;

  // If the user navigates away, we need to mark them as not ready.
  useEffect(() => {
    window.onbeforeunload = (event: BeforeUnloadEvent): string | undefined => {
      if (readyForCalls === "becomingReady" || readyForCalls === "ready") {
        event.preventDefault();

        setReadyForCalls("unready");
        runPromise(
          markLastCall({
            caller,
            device: currentDevice,
            updateCallerMutation: updateCallerKeepAlive,
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

  const currentContact = usePhoneCanvassContact({
    id: currentContactId,
    phoneCanvassId,
  }).data;

  const currentContactDetails = (
    <Group>
      <ContactCard
        style={{ flex: "2 1 0" }}
        phoneCanvassContact={currentContact}
      ></ContactCard>
      <Box style={{ flex: "1 1 0" }}>
        <Text>TODO: notes go here.</Text>
      </Box>
    </Group>
  );

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
                  caller,
                  device: currentDevice,
                  updateCallerMutation: updateCallerNoKeepAlive,
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
                    caller,
                    device: currentDevice,
                    updateCallerMutation: updateCallerNoKeepAlive,
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

  const title = (
    <Title order={1}> Call Party: {phoneCanvassDetails?.name ?? ""} </Title>
  );

  const remainingContacts =
    callPartyStateStore.totalContacts - callPartyStateStore.doneContacts;

  const complete = (
    <Paper shadow="sm" p="xl" radius="md" withBorder>
      <Center>
        <Stack>
          <Title order={3}>Call Party Complete!!!</Title>
          <Image
            w={400}
            src="https://cataas.com/cat/cute?width=400&height=400"
          />
        </Stack>
      </Center>
    </Paper>
  );

  // using callers.length as a proxy for "are we fully loaded"
  const mainContent =
    callPartyStateStore.callers.length > 0 && remainingContacts == 0 ? (
      complete
    ) : (
      <>
        <ToggleReadyButton></ToggleReadyButton>
        {currentContactDetails}
      </>
    );

  return (
    <>
      {title}
      <Group align="start">
        <Stack style={{ flex: 1 }}>
          <h2> Welcome {caller.displayName}</h2>
          {mainContent}
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
