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
import { PhoneCanvasTwilioCallAnsweredCallbackDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { PhoneCanvassScheduler } from "./Scheduler/PhoneCanvassScheduler.js";

function addCallerToCallIfNeeded(params: {
  sid: string;
  contactId: number;
  getCallsBySid: (sid: string) => Call | undefined;
}): VoiceResponse | undefined {
  const call = params.getCallsBySid(params.sid);
  if (call === undefined) {
    throw new Error("Can't find call with sid " + params.sid);
  }
  const callerAlreadyJoined =
    call.status === "IN_PROGRESS" && call.callerId !== undefined;
  if (callerAlreadyJoined) {
    throw new Error(
      "There's only one path to add a caller right now. This should never happen.",
    );
  }
  const response = new VoiceResponse();
  response.dial().conference(
    {
      endConferenceOnExit: true,
      startConferenceOnEnter: true,
      record: "record-from-start",
    },
    String(params.contactId),
  );
  return response;
}

@Injectable()
export class TwilioService {
  getCallsBySid!: (sid: string) => Call | undefined;
  async #getClient(): Promise<twilio.Twilio> {
    const envVars = await getEnvVars();
    return twilio(envVars.TWILIO_API_KEY_SID, envVars.TWILIO_API_KEY_SECRET, {
      accountSid: envVars.TWILIO_SID,
    });
  }

  setGetCallsBySID(f: (sid: string) => Call | undefined): void {
    this.getCallsBySid = f;
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
    twiml
      .dial()
      .conference(
        { startConferenceOnEnter: true, endConferenceOnExit: true },
        String(call.phoneCanvassContactId),
      );

    // TODO(mvp): use the actual phone number.
    void call;
    const callInstance = await client.calls.create({
      to: envVars.TEST_APPROVED_PHONE_NUMBER,
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

  twilioCallAnsweredCallback(
    callback: PhoneCanvasTwilioCallAnsweredCallbackDTO,
    call: Call,
    scheduler: PhoneCanvassScheduler,
  ): string {
    if (call.twilioSid === undefined) {
      throw new Error("Call answered before it was queued.");
    }
    if (call.status !== "IN_PROGRESS") {
      throw new Error("Call answered before being in progress");
    }
    if (callback.AnsweredBy === "human" || callback.AnsweredBy === "unknown") {
      const callerId = scheduler.getNextIdleCallerId();
      if (callerId === undefined) {
        throw new Error("TODO(mvp) handle overcalling");
      }
      const response = addCallerToCallIfNeeded({
        sid: call.twilioSid,
        contactId: call.phoneCanvassContactId,
        getCallsBySid: this.getCallsBySid,
      });
      call.update(call.status, {
        answeredBy: callback.AnsweredBy,
        callerId,
      });
      if (response === undefined) {
        return new VoiceResponse().toString();
      }
      return response.toString();
    }

    // TODO: play a voicemail.
    /*response.play(
     // "https://api.twilio.com/cowbell.mp3"
          (await getEnvVars()).WEBHOOK_HOST +
            "/phone-canvass/webhooks/get-voicemail/" +
            call.canvassId(),,
    );*/
    call.update("COMPLETED", {
      result: "COMPLETED",
      playedVoicemail: false,
      answeredBy: callback.AnsweredBy,
    });

    const response = new VoiceResponse();
    response.hangup();
    return response.toString();
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
      .remove();
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
    } catch {
      await client.sync.v1
        .services(envVars.TWILIO_SYNC_SERVICE_SID)
        .documents.create({
          uniqueName: phoneCanvassId,
          data,
        });
    }
  }
}
