import { createFileRoute } from "@tanstack/react-router";
import { JSX } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index(): JSX.Element {
  return (
    <>
      <p>Index</p>
      <p> Note that auth is currently disabled!</p>
    </>
  );
}
