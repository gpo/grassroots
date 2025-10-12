import { Injectable } from "@nestjs/common";
import { PhoneCanvassAuthTokenResponseDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { PhoneCanvassSyncData } from "grassroots-shared/PhoneCanvass/PhoneCanvassSyncData";
import { vi } from "vitest";

@Injectable()
export class TwilioServiceMock {
  makeCall = vi.fn(async (): Promise<void> => {
    /* empty */
  });

  getAuthToken(): PhoneCanvassAuthTokenResponseDTO {
    return PhoneCanvassAuthTokenResponseDTO.from({ token: "Fake auth token" });
  }

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
