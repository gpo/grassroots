export interface PendingCall {
  calleeDisplayName: string;
  calleeId: number;
}

export type ActiveCall = PendingCall & {
  callerName: string;
};

export interface ParticipantSummary {
  displayName: string;
  ready: boolean;
}

export interface PhoneCanvassSyncData {
  participants: ParticipantSummary[];
  activeCalls: ActiveCall[];
  pendingCalls: PendingCall[];
}
