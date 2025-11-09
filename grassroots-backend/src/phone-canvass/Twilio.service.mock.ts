import { Injectable } from "@nestjs/common";
import { CallStatus } from "grassroots-shared/dtos/PhoneCanvass/CallStatus.dto";
import { PhoneCanvassSyncData } from "grassroots-shared/PhoneCanvass/PhoneCanvassSyncData";
import { vi } from "vitest";
import { NotStartedCall } from "./Scheduler/PhoneCanvassCall.js";

@Injectable()
export class TwilioServiceMock {
  static sid: number;
  makeCall = vi.fn(
    async (
      _call: NotStartedCall,
    ): Promise<{
      sid: string;
      status: CallStatus;
      timestamp: number;
      // eslint-disable-next-line @typescript-eslint/require-await
    }> => {
      void _call;
      return {
        sid: String(TwilioServiceMock.sid),
        status: "QUEUED",
        // TODO: this probably needs to be injected.
        timestamp: Date.now(),
      };
    },
  );

  setSyncData = vi.fn(
    async (
      phoneCanvassId: string,
      data: PhoneCanvassSyncData,
      // eslint-disable-next-line @typescript-eslint/require-await
    ): Promise<void> => {
      void phoneCanvassId;
      void data;
    },
  );
}
