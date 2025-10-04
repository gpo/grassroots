import { Button, List, ListItem } from "@mantine/core";
import { PhoneCanvassAuthTokenResponseDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";

import { Dispatch, JSX, SetStateAction, useState } from "react";
import { grassrootsAPI } from "../../GrassRootsAPI.js";
import { Device } from "@twilio/voice-sdk";
import { VoidDTO } from "grassroots-shared/dtos/Void.dto";
import { SyncClient } from "twilio-sync";
import { PhoneCanvassSyncData } from "grassroots-shared/PhoneCanvassSyncData";

/*
Flow is:
1. Hit start button.
2. Wait for sync push with initial state.
3. Fetch an auth token.
4. Wait for sync push matching you with someone, call in.
*/

interface StartCallProps {
  phoneCanvassId: string;
  calleeId: number;
}

interface ConnectProps {
  setSyncData: Dispatch<SetStateAction<PhoneCanvassSyncData>>;
  phoneCanvassId: string;
  calleeId: number;
}

type AuthenticatedConnectProps = ConnectProps & { authToken: string };

async function connect(props: ConnectProps): Promise<void> {
  const { phoneCanvassId } = props;
  void VoidDTO.fromFetchOrThrow(
    await grassrootsAPI.POST("/phone-canvass/start-canvass/{id}", {
      params: {
        path: {
          id: phoneCanvassId,
        },
      },
    }),
  );

  const authToken = await getAuthToken(phoneCanvassId);

  await joinSync({ ...props, authToken });
  await startCall({ ...props, authToken });
}

async function joinSync(props: AuthenticatedConnectProps): Promise<void> {
  const { authToken, setSyncData, phoneCanvassId } = props;
  const syncClient = new SyncClient(authToken);

  syncClient.on("connectionStateChanged", (state) => {
    console.log("Sync connection state:", state);
  });

  const doc = await syncClient.document(phoneCanvassId);
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const data = doc.data as PhoneCanvassSyncData;
  setSyncData(data);

  doc.on("updated", (event) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const data = event.data as PhoneCanvassSyncData;
    setSyncData(data);
  });
}

async function startCall(props: AuthenticatedConnectProps): Promise<void> {
  const { authToken, calleeId } = props;
  const device = new Device(authToken, {
    logLevel: 4,
    enableImprovedSignalingErrorPrecision: true,
  });

  device.on("registered", () => {
    console.log("Twilio Device registered (or reregistered) and ready.");
  });

  device.on("error", (error) => {
    throw new Error("Twilio Device Error: " + JSON.stringify(error));
  });

  await device.register();

  const call = await device.connect({
    // These get passed to the controller.
    params: { conference: String(calleeId) },
  });

  call.on("accept", () => {
    console.log("Joined conference.");
  });

  call.on("disconnect", () => {
    console.log("Left conference.");
  });
}

async function getAuthToken(phoneCanvassId: string): Promise<string> {
  const { token } = PhoneCanvassAuthTokenResponseDTO.fromFetchOrThrow(
    await grassrootsAPI.GET("/phone-canvass/auth-token/{id}", {
      params: {
        path: {
          id: phoneCanvassId,
        },
      },
    }),
  );
  return token;
}

export function StartCall(props: StartCallProps): JSX.Element {
  const [syncData, setSyncData] = useState<PhoneCanvassSyncData>({
    participants: [],
    activeCalls: [],
    pendingCalls: [],
  } satisfies PhoneCanvassSyncData);

  const participants = syncData.participants.map((x) => (
    <ListItem key={x}>{x}</ListItem>
  ));
  const activeCalls = syncData.activeCalls.map((x) => (
    <ListItem key={x.calleeId}>{x.calleeDisplayName}</ListItem>
  ));
  const pendingCalls = syncData.pendingCalls.map((x) => (
    <ListItem key={x.calleeId}>{x.calleeDisplayName}</ListItem>
  ));

  return (
    <>
      <Button
        onClick={() => {
          void connect({
            setSyncData,
            ...props,
          });
        }}
      >
        Start Call
      </Button>
      <h1> Placeholder data </h1>
      <h2> Participants </h2>
      <List>{participants}</List>
      <h2> Active Calls </h2>
      <List>{activeCalls}</List>
      <h2> Pending Calls </h2>
      <List>{pendingCalls}</List>
    </>
  );
}
