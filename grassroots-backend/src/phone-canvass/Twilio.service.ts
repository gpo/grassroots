import twilio from "twilio";

import { Injectable } from "@nestjs/common";
import AccessToken from "twilio/lib/jwt/AccessToken.js";
import { PhoneCanvassSyncData } from "grassroots-shared/PhoneCanvass/PhoneCanvassSyncData";
import { getEnvVars } from "../GetEnvVars.js";
import { Call, NotStartedCall } from "./Scheduler/PhoneCanvassCall.js";
import {
  CallStatus,
  twilioCallStatusToCallStatus,
} from "grassroots-shared/dtos/PhoneCanvass/CallStatus.dto";
import VoiceResponse from "twilio/lib/twiml/VoiceResponse.js";
import { PhoneCanvasTwilioCallAnsweredCallbackDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { runPromise } from "grassroots-shared/util/RunPromise";

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
    return undefined;
  }
  const response = new VoiceResponse();
  response.dial().conference(
    {
      endConferenceOnExit: true,
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

  async makeCall(call: NotStartedCall): Promise<{
    sid: string;
    status: CallStatus;
    timestamp: number;
  }> {
    const now = Date.now();
    const envVars = await getEnvVars();

    const client = await this.#getClient();
    const twiml = new VoiceResponse();

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

    // After 2 seconds, if no one has answered the call, dial in the caller.
    setTimeout(() => {
      runPromise(
        (async (): Promise<void> => {
          const response = addCallerToCallIfNeeded({
            sid: callInstance.sid,
            contactId: call.contactId(),
            getCallsBySid: this.getCallsBySid,
          });
          if (response !== undefined) {
            await client.calls(callInstance.sid).update({ twiml: response });
          }
        })(),
        false,
      );
    }, 2000);

    return {
      sid: callInstance.sid,
      status: twilioCallStatusToCallStatus(callInstance.status).status,
      timestamp: now,
    };
  }

  async twilioCallAnsweredCallback(
    callback: PhoneCanvasTwilioCallAnsweredCallbackDTO,
    call: Call & {
      twilioSid: string;
    },
  ): Promise<string> {
    if (callback.AnsweredBy === "human" || callback.AnsweredBy === "unknown") {
      console.log("We don't think this is a machine");
      const response = addCallerToCallIfNeeded({
        sid: call.twilioSid,
        contactId: call.contactId(),
        getCallsBySid: this.getCallsBySid,
      });
      if (response === undefined) {
        return new VoiceResponse().toString();
      }
      return response.toString();
    }
    const response = new VoiceResponse();

    console.log("PLAY VOICEMAIL");
    response.play(
      "https://api.twilio.com/cowbell.mp3" /*
          (await getEnvVars()).WEBHOOK_HOST +
            "/phone-canvass/webhooks/get-voicemail/" +
            call.canvassId(),*/,
    );
    response.hangup();
    if (call.status === "IN_PROGRESS") {
      await call.advanceStatusToCompleted({
        result: "COMPLETED",
        currentTime: Date.now(),
        playedVoicemail: true,
      });
    }
    console.log(response.toString());
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
