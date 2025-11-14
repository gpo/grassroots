// eslint-disable-next-line check-file/filename-naming-convention
import { createFileRoute, redirect } from "@tanstack/react-router";
import { ParticipateInPhoneCanvass } from "../../Features/PhoneCanvass/Components/ParticipateInPhoneCanvass.js";
import { PhoneCanvassCallerDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { grassrootsAPI } from "../../GrassRootsAPI.js";
import { getPhoneCanvassCaller } from "../../Features/PhoneCanvass/Logic/PhoneCanvassCallerStore.js";

export const Route = createFileRoute("/PhoneCanvass/$phoneCanvassId")({
  component: ParticipateInPhoneCanvass,
  beforeLoad: async ({ context, params }) => {
    const refreshCaller = async (
      caller: PhoneCanvassCallerDTO,
    ): Promise<PhoneCanvassCallerDTO> => {
      return PhoneCanvassCallerDTO.fromFetchOrThrow(
        await grassrootsAPI.POST("/phone-canvass/refresh-caller", {
          body: caller,
        }),
      );
    };
    const phoneCanvassCallerStore = context.getPhoneCanvassCallerStore();
    const caller = await getPhoneCanvassCaller({
      refreshCaller,
      activePhoneCanvassId: params.phoneCanvassId,
      phoneCanvassCallerStore,
    });

    if (caller === undefined) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({
        to: "/PhoneCanvass/Register/$phoneCanvassId",
        params: { phoneCanvassId: params.phoneCanvassId },
      });
    }
    return { caller, refreshCaller };
  },
  head: () => ({
    meta: [
      {
        title: "Call Party",
      },
    ],
  }),
});

export const ParticipateInPhoneCanvassRoute = Route;
