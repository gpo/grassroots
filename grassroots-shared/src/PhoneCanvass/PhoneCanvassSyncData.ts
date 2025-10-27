export interface PendingCall {
  calleeDisplayName: string;
  calleeId: number;
}

export type ActiveCall = PendingCall & {
  callerName: string;
};

export interface CallerSummary {
  displayName: string;
  ready: boolean;
}

export interface PhoneCanvassSyncData {
  callers: CallerSummary[];
  activeCalls: ActiveCall[];
  pendingCalls: PendingCall[];
}
