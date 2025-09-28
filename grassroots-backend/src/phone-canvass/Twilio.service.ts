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
  TEST_APPROVED_PHONE_NUMBER: string;
  TWILIO_OUTGOING_NUMBER: string;
  TWILIO_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_API_KEY_SID: string;
  TWILIO_API_KEY_SECRET: string;
  TWILIO_APP_SID: string;

  constructor(private config: ConfigService) {
    this.TEST_APPROVED_PHONE_NUMBER = getEnvStr(
      config,
      "TEST_APPROVED_PHONE_NUMBER",
    );
    this.TWILIO_OUTGOING_NUMBER = getEnvStr(config, "TWILIO_OUTGOING_NUMBER");
    this.TWILIO_SID = getEnvStr(config, "TWILIO_SID");
    this.TWILIO_AUTH_TOKEN = getEnvStr(config, "TWILIO_AUTH_TOKEN");
    this.TWILIO_API_KEY_SID = getEnvStr(config, "TWILIO_API_KEY_SID");
    this.TWILIO_API_KEY_SECRET = getEnvStr(config, "TWILIO_API_KEY_SECRET");
    this.TWILIO_APP_SID = getEnvStr(config, "TWILIO_APP_SID");
  }

  async startCanvass(): Promise<void> {
    // TODO - this should actually be the callee id.
    const CALLEE_ID = 10;
    const client = twilio(this.TWILIO_SID, this.TWILIO_AUTH_TOKEN);

    await client.calls.create({
      to: this.TEST_APPROVED_PHONE_NUMBER,
      from: this.TWILIO_OUTGOING_NUMBER,
      twiml: `<Response><Dial><Conference>${String(CALLEE_ID)}</Conference></Dial></Response>`,
    });
  }

  getAuthToken(): PhoneCanvassAuthTokenResponseDTO {
    const identity = "user";

    const voiceGrant = new AccessToken.VoiceGrant({
      outgoingApplicationSid: this.TWILIO_APP_SID,
    });

    const token = new AccessToken(
      this.TWILIO_SID,
      this.TWILIO_API_KEY_SID,
      this.TWILIO_API_KEY_SECRET,
      { identity: identity },
    );
    token.addGrant(voiceGrant);

    return PhoneCanvassAuthTokenResponseDTO.from({ token: token.toJwt() });
  }
}
