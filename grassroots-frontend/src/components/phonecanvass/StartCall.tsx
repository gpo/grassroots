import { Button } from "@mantine/core";
import { PhoneCanvassAuthTokenResponseDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";

import { Dispatch, JSX, SetStateAction, useState } from "react";
import { grassrootsAPI } from "../../GrassRootsAPI.js";
import { Device } from "@twilio/voice-sdk";
import { VoidDTO } from "grassroots-shared/dtos/Void.dto";

/*
Flow is:
1. Hit start button.
2. Wait for sync push with initial state.
3. Fetch an auth token.
4. Wait for sync push matching you with someone, call in.
*/

// Just a placeholder for now.
interface StartCallProps {
  dummy: number;
}

const TMP_PHONE_CANVAS_ID = "3b359bc1-71a5-478b-905a-3bf88b051d3a";
const TMP_CALLEE_ID = 10;

async function connect(props: {
  setToken: Dispatch<SetStateAction<string | undefined>>;
}): Promise<void> {
  void VoidDTO.fromFetchOrThrow(
    await grassrootsAPI.POST("/phone-canvass/start-canvass/{id}", {
      params: {
        path: {
          id: TMP_PHONE_CANVAS_ID,
        },
      },
    }),
  );

  const authToken = await getAuthToken();
  props.setToken(authToken);

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
    params: { conference: String(TMP_CALLEE_ID) },
  });

  call.on("accept", () => {
    console.log("Joined conference.");
  });

  call.on("disconnect", () => {
    console.log("Left conference.");
  });
}

async function getAuthToken(): Promise<string> {
  const { token } = PhoneCanvassAuthTokenResponseDTO.fromFetchOrThrow(
    await grassrootsAPI.GET("/phone-canvass/auth-token/{id}", {
      params: {
        path: {
          // TODO
          id: TMP_PHONE_CANVAS_ID,
        },
      },
    }),
  );
  return token;
}

export function StartCall(props: StartCallProps): JSX.Element {
  void props;

  const [token, setToken] = useState<string | undefined>(undefined);
  void token;
  return (
    <Button
      onClick={() => {
        void connect({ setToken });
      }}
    >
      Start Call
    </Button>
  );
}
