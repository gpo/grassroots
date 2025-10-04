import { createFileRoute } from "@tanstack/react-router";
import { JSX } from "react";
import { StartCall } from "../../components/phonecanvass/StartCall.js";
export const Route = createFileRoute("/PhoneCanvass/$phoneCanvassId")({
  component: ParticipateInPhoneCanvass,
});

const CALLEE_ID = 10;

function ParticipateInPhoneCanvass(): JSX.Element {
  const { phoneCanvassId } = Route.useParams();

  return (
    <>
      <h1> Call Party </h1>
      <StartCall
        phoneCanvassId={phoneCanvassId}
        calleeId={CALLEE_ID}
      ></StartCall>
    </>
  );
}
