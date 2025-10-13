import { createFileRoute } from "@tanstack/react-router";
import { CreatePhoneCanvass } from "../../Features/PhoneCanvass/Components/CreatePhoneCanvass.js";

export const Route = createFileRoute("/PhoneCanvass/Create")({
  component: CreatePhoneCanvass,
});
