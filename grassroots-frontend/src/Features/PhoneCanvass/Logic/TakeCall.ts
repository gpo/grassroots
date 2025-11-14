import { Device } from "@twilio/voice-sdk";

export async function takeCall(
  device: Device,
  calleeId: string,
): Promise<void> {
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
