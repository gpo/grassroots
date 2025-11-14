import twilio from "twilio";

import { Injectable } from "@nestjs/common";
import AccessToken from "twilio/lib/jwt/AccessToken.js";
import { PhoneCanvassSyncData } from "grassroots-shared/PhoneCanvass/PhoneCanvassSyncData";
import { getEnvVars } from "../GetEnvVars.js";
import { NotStartedCall } from "./Scheduler/PhoneCanvassCall.js";
import {
  CallStatus,
  twilioCallStatusToCallStatus,
} from "grassroots-shared/dtos/PhoneCanvass/CallStatus.dto";
import VoiceResponse from "twilio/lib/twiml/VoiceResponse.js";

@Injectable()
export class TwilioService {
  async #getClient(): Promise<twilio.Twilio> {
    const envVars = await getEnvVars();
    return twilio(envVars.TWILIO_API_KEY_SID, envVars.TWILIO_API_KEY_SECRET, {
      accountSid: envVars.TWILIO_SID,
    });
  }

  async makeCall(call: NotStartedCall): Promise<{
    sid: string;
    status: CallStatus;
    timestamp: number;
  }> {
    const now = Date.now();
    const envVars = await getEnvVars();

    const client = await this.#getClient();

    // Pause to give answering machine detection some time.
    // Configure this by configuring answering machine detection.
    const twiml = new VoiceResponse().pause({ length: 30 });

    const callInstance = await client.calls.create({
      // TODO(mvp): use the actual phone number.
      to: envVars.TEST_APPROVED_PHONE_NUMBER,
      from: envVars.TWILIO_OUTGOING_NUMBER,
      statusCallback:
        (await getEnvVars()).WEBHOOK_HOST +
        "/phone-canvass/webhooks/twilio-callstatus",
      asyncAmd: "true",
      asyncAmdStatusCallback:
        (await getEnvVars()).WEBHOOK_HOST +
        "/phone-canvass/webhooks/twilio-call-answered",
      statusCallbackEvent: [
        "initiated",
        "ringing",
        "answered",
        "completed",
        "answered",
      ],
      // DetectMessageEnd means that for a human, we get the callback right away,
      // but for an answering machine, we only get it when the message finishes playing.
      machineDetection: "DetectMessageEnd",
      twiml,
    });

    return {
      sid: callInstance.sid,
      status: twilioCallStatusToCallStatus(callInstance.status).status,
      timestamp: now,
    };
  }

  async getAuthToken(callerId: string): Promise<string> {
    const envVars = await getEnvVars();

    const token = new AccessToken(
      envVars.TWILIO_SID,
      envVars.TWILIO_API_KEY_SID,
      envVars.TWILIO_API_KEY_SECRET,
      { identity: callerId },
    );
    token.addGrant(
      new AccessToken.VoiceGrant({
        outgoingApplicationSid: envVars.TWILIO_APP_SID,
      }),
    );

    token.addGrant(
      new AccessToken.SyncGrant({
        serviceSid: envVars.TWILIO_SYNC_SERVICE_SID,
      }),
    );

    return token.toJwt();
  }

  async setSyncData(
    phoneCanvassId: string,
    data: PhoneCanvassSyncData,
  ): Promise<void> {
    const envVars = await getEnvVars();
    const client = await this.#getClient();

    try {
      // This fails if the document doesn't already exist. Checking if it exists first introduces
      // an extra unnecessary round trip and some complexity.
      // Instead we just try to update it, and if that fails, create it instead.
      await client.sync.v1
        .services(envVars.TWILIO_SYNC_SERVICE_SID)
        .documents(phoneCanvassId)
        .update({ data });
    } catch {
      await client.sync.v1
        .services(envVars.TWILIO_SYNC_SERVICE_SID)
        .documents.create({ uniqueName: phoneCanvassId, data });
    }
  }
}
