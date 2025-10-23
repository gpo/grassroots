import twilio from "twilio";

import { Injectable } from "@nestjs/common";
import { PhoneCanvassAuthTokenResponseDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import AccessToken from "twilio/lib/jwt/AccessToken.js";
import { PhoneCanvassSyncData } from "grassroots-shared/PhoneCanvass/PhoneCanvassSyncData";
import { getEnvVars } from "../GetEnvVars.js";
import { NotStartedCall } from "./Scheduler/PhoneCanvassCall.js";
import {
  CallStatus,
  TwilioCallStatus,
  twilioCallStatusToCallStatus,
} from "grassroots-shared/dtos/PhoneCanvass/CallStatus.dto";

@Injectable()
export class TwilioService {
  async #getClient(): Promise<twilio.Twilio> {
    const envVars = await getEnvVars();
    return twilio(envVars.TWILIO_API_KEY_SID, envVars.TWILIO_API_KEY_SECRET, {
      accountSid: envVars.TWILIO_SID,
    });
  }

  // Returns the call SID.
  async makeCall(call: NotStartedCall): Promise<{
    sid: string;
    status: CallStatus;
    timestamp: number;
  }> {
    const now = Date.now();

    const envVars = await getEnvVars();

    const client = await this.#getClient();

    const callInstance = await client.calls.create({
      // TODO(mvp): use the actual phone number.
      to: envVars.TEST_APPROVED_PHONE_NUMBER,
      from: envVars.TWILIO_OUTGOING_NUMBER,
      statusCallback:
        (await getEnvVars()).WEBHOOK_HOST +
        "/phone-canvass/webhooks/twilio-callstatus",
      statusCallbackEvent: [
        "initiated",
        "ringing",
        "answered",
        "completed",
        "queued",
      ],
      twiml: `<Response><Dial><Conference>${String(call.contactId())}</Conference></Dial></Response>`,
    });

    return {
      sid: callInstance.sid,
      status: twilioCallStatusToCallStatus(callInstance.status),
      timestamp: now,
    };
  }

  async getAuthToken(): Promise<PhoneCanvassAuthTokenResponseDTO> {
    const envVars = await getEnvVars();
    const identity = "user";

    const token = new AccessToken(
      envVars.TWILIO_SID,
      envVars.TWILIO_API_KEY_SID,
      envVars.TWILIO_API_KEY_SECRET,
      { identity: identity },
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

    await this.makeCall();

    return PhoneCanvassAuthTokenResponseDTO.from({ token: token.toJwt() });
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
