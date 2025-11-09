import { CallResult, CallStatus } from "../dtos/PhoneCanvass/CallStatus.dto.js";

export interface ContactSummary {
  contactDisplayName: string;
  contactId: number;
  status: CallStatus;
  result?: CallResult;
}

export interface CallerSummary {
  callerId: number;
  ready: boolean;
  displayName: string;
}

export interface PhoneCanvassSyncData {
  callers: CallerSummary[];
  contacts: ContactSummary[];
  serverInstanceUUID: string;
}
