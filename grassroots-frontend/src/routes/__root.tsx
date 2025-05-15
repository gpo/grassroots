import "@mantine/core/styles.css";

import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { AppShell, Button, MantineProvider, ScrollArea } from "@mantine/core";
import { Anchor } from "@mantine/core";

export const Route = createRootRoute({
  component: () => (
    <MantineProvider>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: "sm",
        }}
        padding="md"
      >
        <AppShell.Header>
          <h1>Grassroots</h1>
        </AppShell.Header>
        <AppShell.Navbar>
          <AppShell.Section>
            <Anchor renderRoot={() => <Link to="/" />}>Home</Anchor>
          </AppShell.Section>
          <AppShell.Section>
            <Anchor
              renderRoot={(props) => <Link to="/create-contact" {...props} />}
            >
              Create Contact
            </Anchor>
          </AppShell.Section>
          <AppShell.Section>
            <Anchor renderRoot={(props) => <Link to="/s" {...props} />}>
              Search
            </Anchor>
          </AppShell.Section>
          <AppShell.Section>
            <Button>Add 100 Random Contacts</Button>
          </AppShell.Section>
          <AppShell.Section grow component={ScrollArea}></AppShell.Section>
          <AppShell.Section>
            <TanStackRouterDevtools />
          </AppShell.Section>
        </AppShell.Navbar>

        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  ),
});
