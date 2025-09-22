import { createFileRoute } from "@tanstack/react-router";
import { JSX } from "react";

export const Route = createFileRoute("/CreatePhoneCanvass")({
  component: CreatePhoneCanvass,
});

function CreatePhoneCanvass(): JSX.Element {
  return <h1>TODO</h1>;
}
