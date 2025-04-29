import { createFileRoute } from "@tanstack/react-router";
import { JSX } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index(): JSX.Element {
  return <p>TODO</p>;
}
