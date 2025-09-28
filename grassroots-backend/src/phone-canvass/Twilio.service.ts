import twilio from "twilio";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PhoneCanvassAuthTokenResponseDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import AccessToken from "twilio/lib/jwt/AccessToken.js";
import { fail } from "grassroots-shared/util/Fail";

function getEnvStr(config: ConfigService, str: string): string {
  return config.get<string>(str) ?? fail("Missing " + str);
}

@Injectable()
export class TwilioService {
  // Grabbing all the env vars once in the constructor might be a bit nicer, but it currently breaks ci,
  // which doesn't define these env vars.
  constructor(private config: ConfigService) {}

  async startCanvass(): Promise<void> {
    const TEST_APPROVED_PHONE_NUMBER = getEnvStr(
      this.config,
      "TEST_APPROVED_PHONE_NUMBER",
    );
    const TWILIO_OUTGOING_NUMBER = getEnvStr(
      this.config,
      "TWILIO_OUTGOING_NUMBER",
    );
    const TWILIO_SID = getEnvStr(this.config, "TWILIO_SID");
    const TWILIO_AUTH_TOKEN = getEnvStr(this.config, "TWILIO_AUTH_TOKEN");

    // TODO - this should actually be the callee id.
    const CALLEE_ID = 10;
    const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

    await client.calls.create({
      to: TEST_APPROVED_PHONE_NUMBER,
      from: TWILIO_OUTGOING_NUMBER,
      twiml: `<Response><Dial><Conference>${String(CALLEE_ID)}</Conference></Dial></Response>`,
    });
  }

  getAuthToken(): PhoneCanvassAuthTokenResponseDTO {
    const TWILIO_SID = getEnvStr(this.config, "TWILIO_SID");
    const TWILIO_API_KEY_SID = getEnvStr(this.config, "TWILIO_API_KEY_SID");
    const TWILIO_API_KEY_SECRET = getEnvStr(
      this.config,
      "TWILIO_API_KEY_SECRET",
    );
    const TWILIO_APP_SID = getEnvStr(this.config, "TWILIO_APP_SID");
    const identity = "user";

    const voiceGrant = new AccessToken.VoiceGrant({
      outgoingApplicationSid: TWILIO_APP_SID,
    });

    const token = new AccessToken(
      TWILIO_SID,
      TWILIO_API_KEY_SID,
      TWILIO_API_KEY_SECRET,
      { identity: identity },
    );
    token.addGrant(voiceGrant);

    return PhoneCanvassAuthTokenResponseDTO.from({ token: token.toJwt() });
  }
}
