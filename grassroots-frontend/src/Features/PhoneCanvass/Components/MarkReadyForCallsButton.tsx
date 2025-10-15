import { Button } from "@mantine/core";
import { PhoneCanvassParticipantIdentityDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";

import { JSX, useEffect } from "react";
import { CallPartyStateStore } from "../Logic/CallPartyStateStore.js";
import { joinSyncGroup } from "../Logic/JoinSyncGroup.js";
import {
  markReadyForCalls,
  MarkReadyForCallsParams,
} from "../Logic/MarkReadyForCalls.js";

interface MarkReadyForCallsButtonProps {
  identity: PhoneCanvassParticipantIdentityDTO;
  callPartyStateStore: CallPartyStateStore;
  calleeId: number;
  authToken: string;
}

export function MarkReadyForCallsButton(
  props: MarkReadyForCallsButtonProps,
): JSX.Element {
  const { identity, authToken, callPartyStateStore } = props;

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

  return (
    <Button
      onClick={() => {
        void markReadyForCalls(markReadyForCallsParams);
      }}
    >
      Start Call
    </Button>
  );
}
