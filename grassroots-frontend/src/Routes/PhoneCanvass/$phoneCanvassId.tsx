// eslint-disable-next-line check-file/filename-naming-convention
import { createFileRoute, redirect } from "@tanstack/react-router";
import { ParticipateInPhoneCanvass } from "../../Features/PhoneCanvass/Components/ParticipateInPhoneCanvass.js";
import { PhoneCanvassCallerDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { grassrootsAPI } from "../../GrassRootsAPI.js";
import { getPhoneCanvassCaller } from "../../Features/PhoneCanvass/Logic/PhoneCanvassCallerStore.js";

export const Route = createFileRoute("/PhoneCanvass/$phoneCanvassId")({
  component: ParticipateInPhoneCanvass,
  staticData: { isPublic: true },
  beforeLoad: async ({ context, params }) => {
    const phoneCanvassCallerStore = context.getPhoneCanvassCallerStore();

    const refreshCaller = async (
      caller: PhoneCanvassCallerDTO,
    ): Promise<PhoneCanvassCallerDTO> => {
      const refreshedCaller = PhoneCanvassCallerDTO.fromFetchOrThrow(
        await grassrootsAPI.POST("/phone-canvass/update-caller", {
          body: caller,
        }),
      );
      console.log(
        "ROUTE REFRESH to auth token",
        refreshedCaller.authToken.slice(-10, -1),
      );

      phoneCanvassCallerStore.setCaller(refreshedCaller);
      return refreshedCaller;
    };
    const caller = await getPhoneCanvassCaller({
      refreshCaller,
      activePhoneCanvassId: params.phoneCanvassId,
      phoneCanvassCallerStore,
      // This ensures the server knows this client exists.
      forceRefresh: true,
    });

    if (caller === undefined) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({
        to: "/PhoneCanvass/Register/$phoneCanvassId",
        params: { phoneCanvassId: params.phoneCanvassId },
      });
    }
    return { refreshCaller, initialCaller: caller };
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
