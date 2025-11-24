import { CallResult, CallStatus } from "../dtos/PhoneCanvass/CallStatus.dto.js";

export interface ContactSummary {
  contactDisplayName: string;
  contactId: number;
  status: CallStatus;
  result?: CallResult;
  callerId: number | undefined;
}

export interface CallerSummary {
  callerId: number;
  ready: "ready" | "unready" | "last call";
  displayName: string;
}

export interface PhoneCanvassSyncData {
  callers: CallerSummary[];
  contacts: ContactSummary[];
  serverInstanceUUID: string;
  phoneCanvassId: string;
}
