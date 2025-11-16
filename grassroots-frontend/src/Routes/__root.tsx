// eslint-disable-next-line check-file/filename-naming-convention
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from "@tanstack/react-router";

import {
  AppShell,
  Group,
  MantineProvider,
  ScrollArea,
  Stack,
  Title,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { RoutedLink } from "../Components/RoutedLink.js";
import { navigateToBackendRoute } from "../GrassRootsAPI.js";
import { LoginState } from "../Features/Auth/Logic/LoginStateContext.js";
import { DevTools } from "../Features/Devtools/Components/DevTools.js";
import { PhoneCanvassCallerStore } from "../Features/PhoneCanvass/Logic/PhoneCanvassCallerStore.js";

interface RouterContext {
  loginState: Promise<LoginState | undefined>;
  getPhoneCanvassCallerStore: () => PhoneCanvassCallerStore;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <MantineProvider>
      <HeadContent />
      <Notifications />

      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: "sm",
        }}
        padding="md"
      >
        <AppShell.Header>
          <Group h="100%" px="md">
            <Title>Grassroots</Title>
          </Group>
        </AppShell.Header>
        <AppShell.Navbar p="md">
          <AppShell.Section grow component={ScrollArea}>
            <Stack>
              <RoutedLink to="/">Home</RoutedLink>
              <RoutedLink to="/PhoneCanvass/Create">
                Create Phone Canvass
              </RoutedLink>
            </Stack>
          </AppShell.Section>
        </AppShell.Navbar>

        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
        <DevTools></DevTools>
      </AppShell>
    </MantineProvider>
  ),
  beforeLoad: async ({ context, location, matches }) => {
    const isPublic = matches.some((m) => m.staticData.isPublic === true);
    if (isPublic) {
      return;
    }

    const loginState = await context.loginState;
    if (!loginState) {
      navigateToBackendRoute("/auth/login", { redirect_path: location.href });
    }
  },
});
