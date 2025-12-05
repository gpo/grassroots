import { JSX, useEffect, useRef, useState } from "react";
import {
  usePhoneCanvassCaller,
  usePhoneCanvassCallerStore,
} from "../Logic/PhoneCanvassCallerStore.js";
import {
  Accordion,
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
  Modal,
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
import {
  UpdateCallerMutation,
  useUpdateCaller,
} from "../Logic/UseUpdateCaller.js";
import { MicrophoneTester } from "./MicrophoneTester.js";
import { PhoneCanvassCallerDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { useOverrideAnsweredByMachine } from "../Logic/UseOverrideAnsweredByMachine.js";

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
  const percent = total === 0 ? 100 : Math.round((done / total) * 100);
  return (
    <>
      <Group justify="space-between" mb="xs">
        <Text size="sm" c="dimmed">
          {done} / {total}
        </Text>
        <Text size="sm" c="dimmed">
          {percent}%
        </Text>
      </Group>

      <Progress value={percent} size="lg"></Progress>
    </>
  );
}

type ReadyPendingState = "becomingReady" | "becomingUnready" | undefined;

const ToggleReadyButton = (props: {
  ready: "ready" | "unready" | "last call";
  readyPendingState: ReadyPendingState;
  setReadyPendingState: (state: ReadyPendingState) => void;
  currentDevice: Device | undefined;
  caller: PhoneCanvassCallerDTO;
  updateCallerMutation: UpdateCallerMutation;
  setCurrentDevice: React.Dispatch<React.SetStateAction<Device | undefined>>;
}): JSX.Element => {
  console.log("BUTTON RERENDER");
  const {
    ready,
    readyPendingState,
    setReadyPendingState,
    caller,
    currentDevice,
    updateCallerMutation,
    setCurrentDevice,
  } = props;
  if (ready === "last call") {
    return (
      <Button flex={1} color="red" disabled={true}>
        You might still be needed!
      </Button>
    );
  }
  if (ready === "ready" || readyPendingState === "becomingUnready") {
    return (
      <Button
        flex={1}
        disabled={readyPendingState === "becomingUnready"}
        onClick={() => {
          setReadyPendingState("becomingUnready");
          runPromise(
            (async (): Promise<void> => {
              await markLastCall({
                caller,
                device: currentDevice,
                updateCallerMutation,
              });
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
        flex={1}
        disabled={readyPendingState === "becomingReady"}
        onClick={() => {
          setReadyPendingState("becomingReady");
          runPromise(
            (async (): Promise<void> => {
              const device = (
                await markReadyForCalls({
                  caller,
                  device: currentDevice,
                  updateCallerMutation,
                })
              ).device;
              setCurrentDevice(device);
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

export function ParticipateInPhoneCanvass(): JSX.Element {
  const { phoneCanvassId } = ParticipateInPhoneCanvassRoute.useParams();

  console.log("PAGE RERENDER");

  const callPartyStateStoreRef = useRef(createCallPartyStateStore());
  const callPartyStateStore = useStore(callPartyStateStoreRef.current);
  const phoneCanvassCallerStore = usePhoneCanvassCallerStore();

  const [currentDevice, setCurrentDevice] = useState<Device | undefined>();
  const [currentContactId, setCurrentContactId] = useState<
    number | undefined
  >();
  const [ready, setReady] = useState<"ready" | "unready" | "last call">(
    "unready",
  );
  const [readyPendingState, setReadyPendingState] =
    useState<ReadyPendingState>(undefined);
  const [testingMic, setTestingMic] = useState<boolean>(false);

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
      if (readyPendingState === "becomingReady" || ready === "ready") {
        event.preventDefault();

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
  }, [ready, readyPendingState, currentContactId]);

  const currentContact = usePhoneCanvassContact({
    id: currentContactId,
    phoneCanvassId,
  }).data;

  const onNewContact = (contact: ContactSummary | undefined): void => {
    setCurrentContactId(contact?.contactId);
  };

  const onReadyChanged = (ready: "ready" | "unready" | "last call"): void => {
    console.log("onReadyChanged", ready);
    setReady(ready);
    setReadyPendingState(undefined);
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
        onReadyChanged,
      }),
      false,
    );
  }, []);

  const phoneCanvassDetails = usePhoneCanvassDetails(phoneCanvassId).data;

  const overrideAnsweredByMachine = useOverrideAnsweredByMachine();

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
        <Table.Td> {CALLER_READY_EMOJIS[ready]}</Table.Td>
      </Table.Tr>
    );
  });

  const TestMicrophoneAudioButton = (): JSX.Element => {
    return (
      <Button
        flex={1}
        onClick={() => {
          setTestingMic(true);
        }}
      >
        Test Audio
      </Button>
    );
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
        <Group w={"100%"}>
          <ToggleReadyButton
            ready={ready}
            readyPendingState={readyPendingState}
            setReadyPendingState={setReadyPendingState}
            currentDevice={currentDevice}
            caller={caller}
            updateCallerMutation={updateCallerNoKeepAlive}
            setCurrentDevice={setCurrentDevice}
          ></ToggleReadyButton>
          <TestMicrophoneAudioButton></TestMicrophoneAudioButton>
          <Button
            disabled={currentContactId === undefined}
            onClick={() => {
              runPromise(
                (async (): Promise<void> => {
                  if (currentContactId === undefined) {
                    throw new Error("Button should be disabld.");
                  }
                  await overrideAnsweredByMachine({
                    phoneCanvassId: phoneCanvassId,
                    contactId: currentContactId,
                  });
                })(),
                true,
              );
            }}
          >
            Answered By Machine
          </Button>
        </Group>
        <ContactCard
          phoneCanvassContact={currentContact}
          phoneCanvassId={phoneCanvassId}
        ></ContactCard>
      </>
    );

  return (
    <>
      {title}
      <Modal
        title="Test Microphone"
        opened={testingMic}
        onClose={() => {
          setTestingMic(false);
        }}
      >
        <MicrophoneTester></MicrophoneTester>
      </Modal>
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
