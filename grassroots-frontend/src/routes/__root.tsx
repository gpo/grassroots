import "@mantine/core/styles.css";

import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { AppShell, Button, MantineProvider, ScrollArea } from "@mantine/core";
import { RoutedLink } from "../components/RoutedLink";

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
            <RoutedLink to="/">Home</RoutedLink>
          </AppShell.Section>
          <AppShell.Section>
            <RoutedLink to="/CreateContact">Create Contact</RoutedLink>
          </AppShell.Section>
          <AppShell.Section>
            <RoutedLink to="/Search">Search</RoutedLink>
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
