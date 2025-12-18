import { forwardRef, JSX, useEffect, useRef, useState } from "react";
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
  ButtonProps,
} from "@mantine/core";
import { ParticipateInPhoneCanvassRoute } from "../../../Routes/PhoneCanvass/$phoneCanvassId.js";
import { useStore } from "zustand";
import { createCallPartyStateStore } from "../Logic/CallPartyStateStore.js";
import { joinTwilioSyncGroup } from "../Logic/JoinTwilioSyncGroup.js";
import { runPromise } from "grassroots-shared/util/RunPromise";
import { ContactSummary } from "grassroots-shared/PhoneCanvass/PhoneCanvassSyncData";
import { takeCall } from "../Logic/TakeCall.js";
import { markReadyForCalls } from "../Logic/MarkReadyForCalls.js";
import { Device } from "@twilio/voice-sdk";
import { usePhoneCanvassDetails } from "../Logic/UsePhoneCanvassDetails.js";
import { usePhoneCanvassContact } from "../Logic/UsePhoneCanvassContact.js";
import { ContactCard } from "../../Contacts/Components/ContactCard.js";
import { notifications } from "@mantine/notifications";
import { CallStatus } from "grassroots-shared/dtos/PhoneCanvass/CallStatus.dto";
import {
  CreateOrUpdateCallerMutation,
  useCreateOrUpdateCallerMutation,
} from "../Logic/UseCreateOrUpdateCaller.js";
import { MicrophoneTester } from "./MicrophoneTester.js";
import {
  CallReadyStatus,
  PhoneCanvassCallerDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { useOverrideAnsweredByMachine } from "../Logic/UseOverrideAnsweredByMachine.js";
import { useHangup } from "../Logic/UseHangup.js";
import {
  IconMicrophone,
  IconPhone,
  IconPhoneOff,
  IconRobot,
} from "@tabler/icons-react";

const CALL_STATUS_EMOJIS: Record<CallStatus, string> = {
  NOT_STARTED: " ",
  QUEUED: "⏱️",
  INITIATED: "⏱️",
  RINGING: "🔔",
  IN_PROGRESS: "📞",
  COMPLETED: "✅",
};

const CALLER_READY_EMOJIS: Record<CallReadyStatus, string> = {
  ready: "🟢",
  unready: "🔴",
};

function CallPartyProgress(props: {
  total: number;
  done: number;
  phoneCanvassId: string;
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

      <Progress
        key={
          props.phoneCanvassId /*
      This is required to prevent the progress bar from animating from the prior phone canvass state.
      TODO: I'm still seeing the bug sometimes though.
      */
        }
        value={percent}
        size="lg"
      ></Progress>
    </>
  );
}

type ReadyPendingState = "becomingReady" | undefined;

type CallStateButtonProps = ButtonProps & {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export const CallStateButton = forwardRef<
  HTMLButtonElement,
  CallStateButtonProps
>(({ children, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      justify="flex-start"
      {...props}
      fullWidth
      style={{
        justifyContent: "flex-start",
      }}
    >
      {children}
    </Button>
  );
});

CallStateButton.displayName = "CallStateButton";

const NextCallButton = (props: {
  ready: CallReadyStatus;
  readyPendingState: ReadyPendingState;
  setReadyPendingState: (state: ReadyPendingState) => void;
  currentDevice: Device | undefined;
  caller: PhoneCanvassCallerDTO;
  createOrUpdateCallerMutation: CreateOrUpdateCallerMutation;
  setCurrentDevice: React.Dispatch<React.SetStateAction<Device | undefined>>;
}): JSX.Element => {
  const {
    ready,
    readyPendingState,
    setReadyPendingState,
    caller,
    currentDevice,
    createOrUpdateCallerMutation,
    setCurrentDevice,
  } = props;
  console.log({ readyPendingState, ready });
  return (
    <CallStateButton
      color="green"
      leftSection={<IconPhone />}
      disabled={readyPendingState != undefined || ready != "unready"}
      onClick={() => {
        setReadyPendingState("becomingReady");
        runPromise(
          (async (): Promise<void> => {
            const device = (
              await markReadyForCalls({
                caller,
                device: currentDevice,
                createOrUpdateCallerMutation,
              })
            ).device;
            setCurrentDevice(device);
          })(),
          false,
        );
      }}
    >
      {readyPendingState === undefined && ready === "ready"
        ? "Calling"
        : "Next Call"}
    </CallStateButton>
  );
};

export function ParticipateInPhoneCanvass(): JSX.Element {
  const { phoneCanvassId } = ParticipateInPhoneCanvassRoute.useParams();

  const callPartyStateStoreRef = useRef(createCallPartyStateStore());
  const callPartyStateStore = useStore(callPartyStateStoreRef.current);
  const phoneCanvassCallerStore = usePhoneCanvassCallerStore();

  const [currentDevice, setCurrentDevice] = useState<Device | undefined>();
  const [currentContactId, setCurrentContactId] = useState<
    number | undefined
  >();
  const [lastContactId, setLastContactId] = useState<number | undefined>();
  const [ready, setReady] = useState<CallReadyStatus>("unready");
  const [readyPendingState, setReadyPendingState] =
    useState<ReadyPendingState>(undefined);
  const [testingMic, setTestingMic] = useState<boolean>(false);

  const createOrUpdateCallerMutation = useCreateOrUpdateCallerMutation({
    phoneCanvassId,
    phoneCanvassCallerStore,
  });

  const { initialCaller } = ParticipateInPhoneCanvassRoute.useRouteContext();

  const caller =
    usePhoneCanvassCaller({
      createOrUpdateCallerMutation,
      activePhoneCanvassId: phoneCanvassId,
      phoneCanvassCallerStore,
    }) ?? initialCaller;

  useEffect(() => {
    window.onbeforeunload = (event: BeforeUnloadEvent): string | undefined => {
      // TODO: This is a bit overly aggressive about preventing people from leaving.
      if (
        currentContactId !== undefined ||
        readyPendingState === "becomingReady" ||
        ready === "ready"
      ) {
        notifications.show({
          title: "Please wait before leaving!",
          message: "We might need your for another call or two!",
          color: "red",
        });
        event.preventDefault();
        return "Please wait before leaving!";
      }
    };
  }, [ready, readyPendingState, currentContactId]);

  const currentContact = usePhoneCanvassContact({
    id: currentContactId,
    phoneCanvassId,
  }).data;

  const lastContact = usePhoneCanvassContact({
    id: lastContactId,
    phoneCanvassId,
  }).data;

  // TODO: this can't ready from any data, or it will be stale.
  const onNewContact = (contact: ContactSummary | undefined): void => {
    setCurrentContactId((prior) => {
      if (contact === prior) {
        return;
      }
      setLastContactId(prior);
      return contact?.contactId;
    });
  };

  const onReadyChanged = (ready: CallReadyStatus): void => {
    setReady(ready);
    setReadyPendingState(undefined);
    if (ready === "ready") {
      setLastContactId(undefined);
      setCurrentContactId(undefined);
    }
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
        callPartyStateStore: callPartyStateStoreRef.current,
        phoneCanvassCallerStore,
        createOrUpdateCallerMutation,
        onNewContact,
        onReadyChanged,
      }),
      false,
    );
  }, []);

  const phoneCanvassDetails = usePhoneCanvassDetails(phoneCanvassId).data;

  const overrideAnsweredByMachine = useOverrideAnsweredByMachine();
  const hangup = useHangup();

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

  const TestMicrophoneAudioButton = (): JSX.Element => {
    return (
      <CallStateButton
        leftSection={<IconMicrophone />}
        disabled={ready !== "unready"}
        onClick={() => {
          setTestingMic(true);
        }}
      >
        Test Audio
      </CallStateButton>
    );
  };

  const AnsweredByMachineButton = (): JSX.Element => {
    return (
      <CallStateButton
        leftSection={<IconRobot />}
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
      </CallStateButton>
    );
  };

  const HangupButton = (): JSX.Element => {
    return (
      <CallStateButton
        color="red"
        leftSection={<IconPhoneOff />}
        disabled={currentContactId === undefined}
        onClick={() => {
          runPromise(
            (async (): Promise<void> => {
              if (currentContactId === undefined) {
                throw new Error("Button should be disabld.");
              }
              await hangup({
                phoneCanvassId: phoneCanvassId,
                contactId: currentContactId,
              });
            })(),
            true,
          );
        }}
      >
        Hangup
      </CallStateButton>
    );
  };

  const title = (
    <Title order={1} mb="xs">
      {" "}
      Call Party: {phoneCanvassDetails?.name ?? ""} –{" "}
      <span style={{ color: "var(--mantine-color-dimmed)" }}>
        Welcome {caller.displayName}
      </span>
    </Title>
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
      <ContactCard
        phoneCanvassContact={currentContact ?? lastContact}
        phoneCanvassId={phoneCanvassId}
      >
        <NextCallButton
          ready={ready}
          readyPendingState={readyPendingState}
          setReadyPendingState={setReadyPendingState}
          currentDevice={currentDevice}
          caller={caller}
          createOrUpdateCallerMutation={createOrUpdateCallerMutation}
          setCurrentDevice={setCurrentDevice}
        ></NextCallButton>
        <HangupButton></HangupButton>
        <AnsweredByMachineButton></AnsweredByMachineButton>
        <TestMicrophoneAudioButton></TestMicrophoneAudioButton>
      </ContactCard>
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
        <Stack style={{ flex: 1 }}>{mainContent}</Stack>
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
                {callPartyStateStore.totalContacts === 0 ? undefined : (
                  <CallPartyProgress
                    total={callPartyStateStore.totalContacts}
                    done={callPartyStateStore.doneContacts}
                    phoneCanvassId={phoneCanvassId}
                  ></CallPartyProgress>
                )}
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
