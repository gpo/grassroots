import { Button, List, ListItem } from "@mantine/core";
import {
  PhoneCanvassAuthTokenResponseDTO,
  PhoneCanvassParticipantIdentityDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";

import { Dispatch, JSX, SetStateAction, useEffect, useState } from "react";
import { grassrootsAPI } from "../../../GrassRootsAPI.js";
import { Device } from "@twilio/voice-sdk";
import { VoidDTO } from "grassroots-shared/dtos/Void.dto";
import { SyncClient } from "twilio-sync";
import { PhoneCanvassSyncData } from "grassroots-shared/PhoneCanvass/PhoneCanvassSyncData";
import { fail } from "grassroots-shared/util/Fail";
import { propsOf } from "grassroots-shared/util/TypeUtils";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

/*
Flow is:
1. Hit start button.
2. Wait for sync push with initial state.
3. Fetch an auth token.
4. Wait for sync push matching you with someone, call in.
*/

interface ConnectParams {
  setSyncData: Dispatch<SetStateAction<PhoneCanvassSyncData>>;
  callerIdentity: PhoneCanvassParticipantIdentityDTO;
  calleeId: number;
  authToken: string;
}

async function joinSyncGroup(connectParams: ConnectParams): Promise<void> {
  const { setSyncData, callerIdentity, authToken } = connectParams;
  const syncClient = new SyncClient(authToken);

  syncClient.on("connectionStateChanged", (state) => {
    console.log("Sync connection state:", state);
  });

  const doc = await syncClient.document(callerIdentity.activePhoneCanvassId);

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const data = doc.data as PhoneCanvassSyncData;
  setSyncData(data);

  doc.on("updated", () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const data = doc.data as PhoneCanvassSyncData;
    setSyncData(data);
  });
}

async function enableCalls(connectParams: ConnectParams): Promise<void> {
  const { callerIdentity, calleeId, authToken } = connectParams;

  void VoidDTO.fromFetchOrThrow(
    await grassrootsAPI.POST("/phone-canvass/update-participant", {
      body: PhoneCanvassParticipantIdentityDTO.from({
        ...propsOf(callerIdentity),
        ready: true,
      }),
    }),
  );

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

function useAuthToken(phoneCanvassId: string): UseQueryResult<string> {
  return useQuery<string>({
    queryKey: ["authtoken", phoneCanvassId],
    queryFn: async () => {
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
    },
  });
}

interface StartCallProps {
  callerIdentity: PhoneCanvassParticipantIdentityDTO;
  calleeId: number;
}

export function StartCall(props: StartCallProps): JSX.Element {
  const { callerIdentity } = props;
  const phoneCanvassId = callerIdentity.activePhoneCanvassId;
  const [syncData, setSyncData] = useState<PhoneCanvassSyncData>({
    participants: [],
    activeCalls: [],
    pendingCalls: [],
  } satisfies PhoneCanvassSyncData);

  const authToken = useAuthToken(phoneCanvassId).data;

  const connectParams: ConnectParams | undefined =
    authToken === undefined
      ? undefined
      : {
          ...props,
          authToken,
          setSyncData,
        };

  useEffect(() => {
    void (async (): Promise<void> => {
      if (connectParams === undefined) {
        return;
      }
      await joinSyncGroup(connectParams);
    })();
  }, [authToken]);

  const participants = syncData.participants.map((x) => (
    <ListItem key={x.displayName}>
      {x.displayName} is {x.ready ? "ready" : "not ready"}
    </ListItem>
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
          void enableCalls(connectParams ?? fail("Missing auth token"));
        }}
      >
        Start Call
      </Button>
      <h2> Participants </h2>
      <List>{participants}</List>
      <h2> Active Calls </h2>
      <List>{activeCalls}</List>
      <h2> Pending Calls </h2>
      <List>{pendingCalls}</List>
    </>
  );
}
