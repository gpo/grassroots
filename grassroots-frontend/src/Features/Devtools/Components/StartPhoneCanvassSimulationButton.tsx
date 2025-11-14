import { Button } from "@mantine/core";
import { JSX } from "react";
import { useStartPhoneCanvassSimulation } from "../Logic/UseStartPhoneCanvassSimulation.js";
import { useMatchRoute } from "@tanstack/react-router";

interface StartPhoneCanvassSimulationButtonParams {
  postClick: () => void;
}

export function StartPhoneCanvassSimulationButton(
  params: StartPhoneCanvassSimulationButtonParams,
): JSX.Element | undefined {
  const startPhoneCanvassSimulation = useStartPhoneCanvassSimulation();

  // Check if we're on the phone canvass participation page.
  // If not, we won't show the button.
  const matchRoute = useMatchRoute();
  const match = matchRoute({
    to: "/PhoneCanvass/$phoneCanvassId",
  });

  if (match === false) {
    return undefined;
  }

  const { phoneCanvassId } = match;

  return (
    <Button
      onClick={() => {
        void (async (): Promise<void> => {
          await startPhoneCanvassSimulation.mutateAsync(phoneCanvassId);
          params.postClick();
        })();
      }}
    >
      Start phone canvass simulation.
    </Button>
  );
}
