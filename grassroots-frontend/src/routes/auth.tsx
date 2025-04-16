import { createFileRoute } from "@tanstack/react-router";
import { getRoutingComponent } from "supertokens-auth-react/ui";
import { EmailPasswordPreBuiltUI } from "supertokens-auth-react/recipe/emailpassword/prebuiltui";
import { JSX } from "react";

export const Route = createFileRoute("/auth")({
  component: AuthUI,
});

function AuthUI(): JSX.Element {
  console.log("AUTH UI CHECK");
  // This cast is required because of a React version mismatch between what we use and Supertokens.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return getRoutingComponent([EmailPasswordPreBuiltUI]) as JSX.Element;
}
