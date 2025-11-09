import { Device } from "@twilio/voice-sdk";
import { PhoneCanvassCallerDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { VoidDTO } from "grassroots-shared/dtos/Void.dto";
import { propsOf } from "grassroots-shared/util/TypeUtils";
import { grassrootsAPI } from "../../../GrassRootsAPI.js";

/*
Flow is:
1. Hit "I'm ready" button.
2. Wait for sync push with initial state.
3. Fetch an auth token.
4. Wait for sync push matching you with someone, call in.
*/

export interface MarkReadyForCallsParams {
  caller: PhoneCanvassCallerDTO;
}

export async function markReadyForCalls(
  params: MarkReadyForCallsParams,
): Promise<{ device: Device }> {
  const { caller } = params;

  VoidDTO.fromFetchOrThrow(
    await grassrootsAPI.POST("/phone-canvass/update-caller", {
      body: PhoneCanvassCallerDTO.from({
        ...propsOf(caller),
        ready: true,
      }),
    }),
  );

  // TODO(MVP): this should happen when we're actually matched with a callee.
  const device = new Device(caller.authToken, {
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
