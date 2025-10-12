import { Button, List, ListItem } from "@mantine/core";
import { PhoneCanvassParticipantIdentityDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";

import { JSX, useEffect } from "react";
import { fail } from "grassroots-shared/util/Fail";
import { createCallPartyStateStore } from "../Logic/CallPartyStateStore.js";
import { joinSyncGroup } from "../Logic/JoinSyncGroup.js";
import { useAuthToken } from "../Logic/UseAuthToken.js";
import { useStore } from "zustand";
import {
  markReadyForCalls,
  MarkReadyForCallsParams,
} from "../Logic/MarkReadyForCalls.js";

interface StartCallProps {
  identity: PhoneCanvassParticipantIdentityDTO;
  calleeId: number;
  authToken: string;
}

export function StartCall(props: StartCallProps): JSX.Element {
  const { identity, authToken } = props;
  const callPartyStateStore = useStore(createCallPartyStateStore());

  const markReadyForCallsParams: MarkReadyForCallsParams = {
    callerIdentity: identity,
    authToken,
    calleeId: props.calleeId,
  };

  useEffect(() => {
    void (async (): Promise<void> => {
      await joinSyncGroup({
        identity: new PhoneCanvassParticipantIdentityDTO(),
        callPartyStateStore: callPartyStateStore,
        authToken: authToken,
      });
    })();
  }, [authToken]);

  const participants = callPartyStateStore.participants.map((x) => (
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
      <Button
        onClick={() => {
          void markReadyForCalls(markReadyForCallsParams);
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
