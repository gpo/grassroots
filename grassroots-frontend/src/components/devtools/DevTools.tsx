import { Affix, AppShell, Button, Drawer } from "@mantine/core";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { JSX, useState } from "react";
import { AddFakeDataButton } from "./AddFakeDataButton.jsx";

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
          <AppShell.Section>
            <AddFakeDataButton></AddFakeDataButton>
          </AppShell.Section>
          <AppShell.Section>
            <TanStackRouterDevtools />
          </AppShell.Section>
        </AppShell.Navbar>
      </Drawer>
    </>
  );
}
