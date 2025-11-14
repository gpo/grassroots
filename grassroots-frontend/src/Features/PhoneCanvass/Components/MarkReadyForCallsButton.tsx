import { Button } from "@mantine/core";
import { PhoneCanvassCallerDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";

import { JSX } from "react";
import {
  markReadyForCalls,
  MarkReadyForCallsParams,
} from "../Logic/MarkReadyForCalls.js";

interface MarkReadyForCallsButtonProps {
  caller: PhoneCanvassCallerDTO;
}

export function MarkReadyForCallsButton(
  props: MarkReadyForCallsButtonProps,
): JSX.Element {
  const { caller } = props;

  const markReadyForCallsParams: MarkReadyForCallsParams = {
    caller,
  };

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
