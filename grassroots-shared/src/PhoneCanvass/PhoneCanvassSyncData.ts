import { CallResult, CallStatus } from "../dtos/PhoneCanvass/CallStatus.dto.js";
import { CallReadyStatus } from "../dtos/PhoneCanvass/PhoneCanvass.dto.js";

export interface ContactSummary {
  contactDisplayName: string;
  contactId: number;
  status: CallStatus;
  result?: CallResult;
  callerId: string | undefined;
}

export interface CallerSummary {
  callerId: string;
  ready: CallReadyStatus;
  displayName: string;
}

export interface PhoneCanvassSyncData {
  callers: CallerSummary[];
  contacts: ContactSummary[];
  serverInstanceUUID: string;
  phoneCanvassId: string;
  totalContacts: number;
  doneContacts: number;
  generation: number;
}
