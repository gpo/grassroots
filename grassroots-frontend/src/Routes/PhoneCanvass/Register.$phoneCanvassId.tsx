import { createFileRoute } from "@tanstack/react-router";
import { RegisterForPhoneCanvass } from "../../Features/PhoneCanvass/Components/RegisterForPhoneCanvass.js";

export const Route = createFileRoute("/PhoneCanvass/Register/$phoneCanvassId")({
  component: RegisterForPhoneCanvass,
});

export const RegisterForPhoneCanvassRoute = Route;
