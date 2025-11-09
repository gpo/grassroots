// eslint-disable-next-line check-file/filename-naming-convention
import { createFileRoute, redirect } from "@tanstack/react-router";
import { ParticipateInPhoneCanvass } from "../../Features/PhoneCanvass/Components/ParticipateInPhoneCanvass.js";

export const Route = createFileRoute("/PhoneCanvass/$phoneCanvassId")({
  component: ParticipateInPhoneCanvass,
  beforeLoad: ({ context, params }) => {
    const phoneCanvassCallerStore = context.getPhoneCanvassCallerStore();
    if (phoneCanvassCallerStore.caller === undefined) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({
        to: "/PhoneCanvass/Register/$phoneCanvassId",
        params: { phoneCanvassId: params.phoneCanvassId },
      });
    }
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
