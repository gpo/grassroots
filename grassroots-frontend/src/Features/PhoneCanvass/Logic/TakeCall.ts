import { Device } from "@twilio/voice-sdk";

export async function takeCall(
  device: Device,
  contactId: number,
): Promise<void> {
  device.disconnectAll();
  const call = await device.connect({
    // These get passed to the controller.
    params: { conference: String(contactId) },
  });

  call.on("accept", () => {
    console.log("Joined conference.");
  });

  call.on("disconnect", () => {
    console.log("Left conference.");
  });
}
