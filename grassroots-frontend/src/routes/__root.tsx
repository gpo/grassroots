import "@mantine/core/styles.css";

import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { AppShell, MantineProvider, ScrollArea } from "@mantine/core";
import { RoutedLink } from "../components/RoutedLink";
import { navigateToBackendRoute } from "../GrassRootsAPI";
import { LoginState } from "../context/LoginStateContext";
import { AddFakeDataButton } from "../components/devtools/AddFakeDataButton";

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
          {import.meta.env.MODE === "development" ? (
            <AppShell.Section>
              <AddFakeDataButton></AddFakeDataButton>
            </AppShell.Section>
          ) : null}
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
