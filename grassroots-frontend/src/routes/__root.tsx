import "@mantine/core/styles.css";

import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

import { AppShell, MantineProvider, ScrollArea } from "@mantine/core";
import { RoutedLink } from "../components/RoutedLink.js";
import { navigateToBackendRoute } from "../GrassRootsAPI.js";
import { LoginState } from "../context/LoginStateContext.js";
import { DevTools } from "../components/devtools/DevTools.js";

interface RouterContext {
  loginState: Promise<LoginState | undefined>;
}

export const Route = createRootRouteWithContext<RouterContext>()({
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
            <RoutedLink to="/Search">Search Contacts</RoutedLink>
          </AppShell.Section>
          <AppShell.Section>
            <RoutedLink to="/Users">Users</RoutedLink>
          </AppShell.Section>
          <AppShell.Section>
            <RoutedLink to="/Me">Your Dashboard</RoutedLink>
          </AppShell.Section>
          <AppShell.Section grow component={ScrollArea}></AppShell.Section>
        </AppShell.Navbar>

        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
        <DevTools></DevTools>
      </AppShell>
    </MantineProvider>
  ),
  beforeLoad: async ({ context, location }) => {
    // If we want more unauthenticated routes, we could have a folder of routes that aren't authenticated,
    // or similar.
    if (location.href == "/") {
      return;
    }

    const loginState = await context.loginState;
    if (!loginState) {
      navigateToBackendRoute("/auth/login", { redirect_path: location.href });
    }
  },
});
