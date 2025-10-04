export interface PendingCall {
  calleeDisplayName: string;
  calleeId: number;
}

export type ActiveCall = PendingCall & {
  callerName: string;
};

export interface PhoneCanvassSyncData {
  participants: string[];
  activeCalls: ActiveCall[];
  pendingCalls: PendingCall[];
}
