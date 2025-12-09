import twilio from "twilio";

import { Injectable } from "@nestjs/common";
import AccessToken from "twilio/lib/jwt/AccessToken.js";
import { getEnvVars } from "../GetEnvVars.js";
import { Call } from "./Scheduler/PhoneCanvassCall.js";
import {
  CallStatus,
  twilioCallStatusToCallStatus,
} from "grassroots-shared/dtos/PhoneCanvass/CallStatus.dto";
import VoiceResponse from "twilio/lib/twiml/VoiceResponse.js";

@Injectable()
export class TwilioService {
  getCallBySid!: (sid: string) => Call | undefined;
  async #getClient(): Promise<twilio.Twilio> {
    const envVars = await getEnvVars();
    return twilio(envVars.TWILIO_API_KEY_SID, envVars.TWILIO_API_KEY_SECRET, {
      accountSid: envVars.TWILIO_SID,
    });
  }

  setGetCallsBySID(f: (sid: string) => Call | undefined): void {
    this.getCallBySid = f;
  }

  async makeCall(call: Call): Promise<{
    sid: string;
    status: CallStatus;
  }> {
    if (call.status !== "NOT_STARTED") {
      throw new Error("Can only make calls that aren't started.");
    }
    const envVars = await getEnvVars();

    const client = await this.#getClient();
    const twiml = new VoiceResponse();
    twiml.dial().conference(
      {
        startConferenceOnEnter: true,
        endConferenceOnExit: true,
        waitUrl: "",
        beep: "false",
      },
      String(call.phoneCanvassContactId),
    );

    console.log("HARD CODING NUMBER");
    const callInstance = await client.calls.create({
      to: "226-989-2922" /*call.state.contact.contact.phoneNumber*/,
      from: envVars.TWILIO_OUTGOING_NUMBER,
      record: true,
      statusCallback:
        (await getEnvVars()).WEBHOOK_HOST +
        "/phone-canvass/webhooks/twilio-callstatus",
      asyncAmd: "true",
      asyncAmdStatusCallback:
        (await getEnvVars()).WEBHOOK_HOST +
        "/phone-canvass/webhooks/twilio-call-answered",
      // https://www.twilio.com/docs/voice/answering-machine-detection
      // Tuning these knobs to prioritize latency.
      machineDetectionSpeechEndThreshold: 700,
      machineDetectionSilenceTimeout: 2000,
      machineDetectionTimeout: 2,
      statusCallbackEvent: [
        "initiated",
        "ringing",
        "answered",
        "completed",
        "answered",
      ],
      // Enable means that we're notified as soon as twilio decides who has answered.
      // DetectMessageEnd would mean that for a human, we get the callback right away,
      // but for an answering machine, we only get it when the message finishes playing.
      machineDetection: "Enable",
      twiml,
    });

    return {
      sid: callInstance.sid,
      status: twilioCallStatusToCallStatus(callInstance.status).status,
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

  async clearSyncData(phoneCanvassId: string): Promise<void> {
    const envVars = await getEnvVars();
    const client = await this.#getClient();
    await client.sync.v1
      .services(envVars.TWILIO_SYNC_SERVICE_SID)
      .documents(phoneCanvassId)
      .update({ data: {} });
  }

  async setSyncData(phoneCanvassId: string, data: string): Promise<void> {
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
    } catch (e: unknown) {
      console.log("ERROR IS", e);
      await client.sync.v1
        .services(envVars.TWILIO_SYNC_SERVICE_SID)
        .documents.create({
          uniqueName: phoneCanvassId,
          data,
        });
    }
  }

  async hangup(sid: string): Promise<void> {
    const client = await this.#getClient();
    await client.calls(sid).update({ status: "completed" });
  }
}
