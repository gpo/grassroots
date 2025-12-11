// eslint-disable-next-line check-file/filename-naming-convention
import { createFileRoute, redirect } from "@tanstack/react-router";
import { ParticipateInPhoneCanvass } from "../../Features/PhoneCanvass/Components/ParticipateInPhoneCanvass.js";
import {
  CreateOrUpdatePhoneCanvassCallerDTO,
  PhoneCanvassCallerDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { grassrootsAPI } from "../../GrassRootsAPI.js";
import { getPhoneCanvassCaller } from "../../Features/PhoneCanvass/Logic/PhoneCanvassCallerStore.js";

export const Route = createFileRoute("/PhoneCanvass/$phoneCanvassId")({
  component: ParticipateInPhoneCanvass,
  staticData: { isPublic: true },
  beforeLoad: async ({ context, params }) => {
    const phoneCanvassCallerStore = context.getPhoneCanvassCallerStore();

    const createOrUpdateCaller = async (
      caller: CreateOrUpdatePhoneCanvassCallerDTO,
    ): Promise<PhoneCanvassCallerDTO> => {
      const refreshedCaller = PhoneCanvassCallerDTO.fromFetchOrThrow(
        await grassrootsAPI.POST("/phone-canvass/create-or-update-caller", {
          body: caller,
        }),
      );

      phoneCanvassCallerStore.setCaller(refreshedCaller);
      return refreshedCaller;
    };
    let caller: PhoneCanvassCallerDTO | undefined = undefined;
    try {
      caller = await getPhoneCanvassCaller({
        createOrUpdateCallerMutation: createOrUpdateCaller,
        activePhoneCanvassId: params.phoneCanvassId,
        phoneCanvassCallerStore,
        // This ensures the server knows this client exists.
        forceRefresh: true,
      });
    } catch {
      // If we can't get a caller safely, redirect to login.
    }

    if (caller === undefined) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({
        to: "/PhoneCanvass/Register/$phoneCanvassId",
        params: { phoneCanvassId: params.phoneCanvassId },
      });
    }
    return { initialCaller: caller };
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
