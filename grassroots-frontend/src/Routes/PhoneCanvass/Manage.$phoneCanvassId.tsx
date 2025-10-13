import { createFileRoute } from "@tanstack/react-router";
import { ManagePhoneCanvass } from "../../Features/PhoneCanvass/Components/ManagePhoneCanvass.js";

export const Route = createFileRoute("/PhoneCanvass/Manage/$phoneCanvassId")({
  component: ManagePhoneCanvass,
});

export const ManagePhoneCanvassRoute = Route;
