// eslint-disable-next-line check-file/filename-naming-convention
import "@mantine/core/styles.css";

import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

import { AppShell, MantineProvider, ScrollArea } from "@mantine/core";
import { RoutedLink } from "../Components/RoutedLink.js";
import { navigateToBackendRoute } from "../GrassRootsAPI.js";
import { LoginState } from "../Features/Auth/Logic/LoginStateContext.js";
import { DevTools } from "../Features/Devtools/Components/DevTools.js";

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
            <RoutedLink to="/PhoneCanvass/Create">
              Create Phone Canvass
            </RoutedLink>
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
