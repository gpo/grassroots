import { createFileRoute } from "@tanstack/react-router";
import { JSX } from "react";

export const Route = createFileRoute("/create-contact")({
  component: RouteComponent,
});

function RouteComponent(): JSX.Element {
  return <div>TODO &quot;/create-contact&quot;!</div>;
}
