import twilio from "twilio";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  PhoneCanvassAuthTokenResponseDTO,
  PhoneCanvassContactDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import AccessToken from "twilio/lib/jwt/AccessToken.js";
import { fail } from "grassroots-shared/util/Fail";
import { PhoneCanvassSyncData } from "grassroots-shared/PhoneCanvassSyncData";
import { DocumentInstance } from "twilio/lib/rest/sync/v1/service/document.js";
import { CallInstance } from "twilio/lib/rest/api/v2010/account/call.js";

function getEnvStr(config: ConfigService, str: string): string {
  return config.get<string>(str) ?? fail("Missing " + str);
}

@Injectable()
export class TwilioService {
  // Grabbing all the env vars once in the constructor might be a bit nicer, but it currently breaks ci,
  // which doesn't define these env vars.
  constructor(private config: ConfigService) {}

  getClient(): twilio.Twilio {
    const TWILIO_API_KEY_SID = getEnvStr(this.config, "TWILIO_API_KEY_SID");
    const TWILIO_API_KEY_SECRET = getEnvStr(
      this.config,
      "TWILIO_API_KEY_SECRET",
    );
    const TWILIO_SID = getEnvStr(this.config, "TWILIO_SID");
    return twilio(TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, {
      accountSid: TWILIO_SID,
    });
  }

  async startCanvass(
    phoneCanvassId: string,
    contacts: PhoneCanvassContactDTO[],
  ): Promise<void> {
    await this.setSyncData(phoneCanvassId, {
      participants: ["YOU! (TODO)"],
      activeCalls: [],
      pendingCalls: contacts.map((x) => {
        return {
          calleeDisplayName: x.contact.formatName(),
          calleeId: x.contact.id,
        };
      }),
    });
  }

  async makeCall(): Promise<CallInstance> {
    const TEST_APPROVED_PHONE_NUMBER = getEnvStr(
      this.config,
      "TEST_APPROVED_PHONE_NUMBER",
    );
    const TWILIO_OUTGOING_NUMBER = getEnvStr(
      this.config,
      "TWILIO_OUTGOING_NUMBER",
    );

    // TODO - this should actually be the callee id.
    const CALLEE_ID = 10;
    const client = this.getClient();

    return await client.calls.create({
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
    const TWILIO_SYNC_SERVICE_SID = getEnvStr(
      this.config,
      "TWILIO_SYNC_SERVICE_SID",
    );

    const identity = "user";

    const token = new AccessToken(
      TWILIO_SID,
      TWILIO_API_KEY_SID,
      TWILIO_API_KEY_SECRET,
      { identity: identity },
    );
    token.addGrant(
      new AccessToken.VoiceGrant({
        outgoingApplicationSid: TWILIO_APP_SID,
      }),
    );

    token.addGrant(
      new AccessToken.SyncGrant({
        serviceSid: TWILIO_SYNC_SERVICE_SID,
      }),
    );

    return PhoneCanvassAuthTokenResponseDTO.from({ token: token.toJwt() });
  }

  async setSyncData(
    phoneCanvassId: string,
    data: PhoneCanvassSyncData,
  ): Promise<DocumentInstance> {
    const TWILIO_SYNC_SERVICE_SID = getEnvStr(
      this.config,
      "TWILIO_SYNC_SERVICE_SID",
    );

    const client = this.getClient();

    let doc: undefined | DocumentInstance;
    try {
      // This fails if the document doesn't already exist. Checking if it exists first introduces
      // an extra unnecessary round trip and some complexity.
      // Instead we just try to update it, and if that fails, create it instead.
      doc = await client.sync.v1
        .services(TWILIO_SYNC_SERVICE_SID)
        .documents(phoneCanvassId)
        .update({ data });
    } catch {
      doc = await client.sync.v1
        .services(TWILIO_SYNC_SERVICE_SID)
        .documents.create({ uniqueName: phoneCanvassId, data });
    }
    return doc;
  }
}
