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
  phoneCanvassId: string;
  calleeId: number;
}

async function connect(props: {
  setToken: Dispatch<SetStateAction<string | undefined>>;
  phoneCanvassId: string;
  calleeId: number;
}): Promise<void> {
  void VoidDTO.fromFetchOrThrow(
    await grassrootsAPI.POST("/phone-canvass/start-canvass/{id}", {
      params: {
        path: {
          id: props.phoneCanvassId,
        },
      },
    }),
  );

  const authToken = await getAuthToken(props.phoneCanvassId);
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
    params: { conference: String(props.calleeId) },
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
  void props;

  const [token, setToken] = useState<string | undefined>(undefined);
  void token;
  return (
    <Button
      onClick={() => {
        void connect({
          setToken,
          ...props,
        });
      }}
    >
      Start Call
    </Button>
  );
}
