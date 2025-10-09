import twilio from "twilio";

import { Injectable } from "@nestjs/common";
import { PhoneCanvassAuthTokenResponseDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import AccessToken from "twilio/lib/jwt/AccessToken.js";
import { PhoneCanvassSyncData } from "grassroots-shared/PhoneCanvass/PhoneCanvassSyncData";
import { getEnvVars } from "../GetEnvVars.js";

@Injectable()
export class TwilioService {
  async #getClient(): Promise<twilio.Twilio> {
    const envVars = await getEnvVars();
    return twilio(envVars.TWILIO_API_KEY_SID, envVars.TWILIO_API_KEY_SECRET, {
      accountSid: envVars.TWILIO_SID,
    });
  }

  async makeCall(): Promise<void> {
    const envVars = await getEnvVars();

    // TODO - this should actually be the callee id.
    const CALLEE_ID = 10;
    const client = await this.#getClient();

    await client.calls.create({
      to: envVars.TEST_APPROVED_PHONE_NUMBER,
      from: envVars.TWILIO_OUTGOING_NUMBER,
      twiml: `<Response><Dial><Conference>${String(CALLEE_ID)}</Conference></Dial></Response>`,
    });
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
