import { Device } from "@twilio/voice-sdk";
import { PhoneCanvassCallerDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { VoidDTO } from "grassroots-shared/dtos/Void.dto";
import { propsOf } from "grassroots-shared/util/TypeUtils";
import { grassrootsAPI } from "../../../GrassRootsAPI.js";

/*
Flow is:
1. Fetch an auth token.
2. Wait for sync push with initial state.
3. Hit "I'm ready" button.
4. Wait for sync push matching you with someone, call in.
*/

export interface UpdateReadyStateForCallsParams {
  caller: PhoneCanvassCallerDTO;
  device: Device | undefined;
  keepalive?: true;
}

export async function markUnreadyForCalls(
  params: UpdateReadyStateForCallsParams,
): Promise<void> {
  const { caller } = params;

  VoidDTO.fromFetchOrThrow(
    await grassrootsAPI.POST("/phone-canvass/update-caller", {
      body: PhoneCanvassCallerDTO.from({
        ...propsOf(caller),
        ready: false,
      }),
      keepalive: params.keepalive,
    }),
  );
}

export async function markReadyForCalls(
  params: UpdateReadyStateForCallsParams,
): Promise<{ device: Device }> {
  const { caller } = params;
  let { device } = params;

  // TODO(mvp): use tanstack.
  VoidDTO.fromFetchOrThrow(
    await grassrootsAPI.POST("/phone-canvass/update-caller", {
      body: PhoneCanvassCallerDTO.from({
        ...propsOf(caller),
        ready: true,
      }),
    }),
  );

  if (device !== undefined) {
    return { device };
  }
  device = new Device(caller.authToken, {
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
  return { device };
}
