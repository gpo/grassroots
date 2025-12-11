import { Device } from "@twilio/voice-sdk";
import { PhoneCanvassCallerDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { CreateOrUpdateCallerMutation } from "./UseCreateOrUpdateCaller.js";

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
  createOrUpdateCallerMutation: CreateOrUpdateCallerMutation;
}

export async function markLastCall(
  params: UpdateReadyStateForCallsParams,
): Promise<void> {
  const { caller } = params;
  caller.ready = "last call";
  await params.createOrUpdateCallerMutation(caller.toUpdate());
}

export async function markReadyForCalls(
  params: UpdateReadyStateForCallsParams,
): Promise<{ device: Device }> {
  const { caller } = params;
  let { device } = params;
  caller.ready = "ready";
  await params.createOrUpdateCallerMutation(caller.toUpdate());

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

  device.on("incoming", (e) => {
    throw new Error("We should never have an incoming call." + String(e));
  });

  await device.register();
  return { device };
}
