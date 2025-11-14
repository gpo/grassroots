import { Affix, AppShell, Button, Drawer, Stack } from "@mantine/core";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { JSX, useState } from "react";
import { AddFakeDataButton } from "./AddFakeDataButton.js";
import { StartPhoneCanvassSimulationButton } from "./StartPhoneCanvassSimulationButton.js";

export function DevTools(): JSX.Element {
  const [devtoolsOpen, setDevtoolsShown] = useState(false);
  return (
    <>
      <Affix position={{ bottom: 20, right: 20 }}>
        <Button
          onClick={() => {
            setDevtoolsShown(true);
          }}
        >
          Devtools
        </Button>
      </Affix>
      <Drawer
        position="right"
        opened={devtoolsOpen}
        onClose={() => {
          setDevtoolsShown(false);
        }}
        title="Devtools"
      >
        <AppShell.Navbar>
          <AppShell.Section p="sm">
            <Stack gap="sm">
              <AddFakeDataButton></AddFakeDataButton>
              <StartPhoneCanvassSimulationButton></StartPhoneCanvassSimulationButton>
            </Stack>
          </AppShell.Section>
          <AppShell.Section>
            <TanStackRouterDevtools />
          </AppShell.Section>
        </AppShell.Navbar>
      </Drawer>
    </>
  );
}
