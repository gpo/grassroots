import { createFileRoute } from "@tanstack/react-router";
import { JSX } from "react";

export const Route = createFileRoute("/search")({
  component: RouteComponent,
});

function RouteComponent(): JSX.Element {
  return <div>TODO &quot;/search&quot;!</div>;
}
