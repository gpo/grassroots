import { Device } from "@twilio/voice-sdk";
import { PhoneCanvassParticipantIdentityDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
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
  callerIdentity: PhoneCanvassParticipantIdentityDTO;
  calleeId: number;
  authToken: string;
}

export async function markReadyForCalls(
  params: MarkReadyForCallsParams,
): Promise<void> {
  const { callerIdentity, calleeId, authToken } = params;

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
