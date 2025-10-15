// eslint-disable-next-line check-file/filename-naming-convention
import { createFileRoute } from "@tanstack/react-router";
import { ParticipateInPhoneCanvass } from "../../Features/PhoneCanvass/Components/ParticipateInPhoneCanvass.js";

export const Route = createFileRoute("/PhoneCanvass/$phoneCanvassId")({
  component: ParticipateInPhoneCanvass,
});

export const ParticipateInPhoneCanvassRoute = Route;
