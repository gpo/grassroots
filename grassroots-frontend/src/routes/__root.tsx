import "@mantine/core/styles.css";

import {
  createRootRoute,
  Link,
  LinkProps,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { AppShell, Button, MantineProvider, ScrollArea } from "@mantine/core";
import { Anchor } from "@mantine/core";
import { JSX } from "react";

function AnchorLink({
  to,
  children,
  ...rest
}: {
  to: LinkProps["to"]; // You can further constrain this to `RoutePaths` if desired
  children: React.ReactNode;
}): JSX.Element {
  return (
    <Anchor renderRoot={(props) => <Link to={to} {...props} />} {...rest}>
      {children}
    </Anchor>
  );
}

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
            <AnchorLink to="/">Should Fail</AnchorLink>
          </AppShell.Section>
          <AppShell.Section>
            <AnchorLink to="/CreateContact">Create Contact</AnchorLink>
          </AppShell.Section>
          <AppShell.Section>
            <AnchorLink to="/Search">Search</AnchorLink>
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
