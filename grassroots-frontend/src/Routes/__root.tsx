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
import { useEffect, useState } from "react";
import { runPromise } from "grassroots-shared/util/RunPromise";

const NAV_BAR_WIDTH = 300;

interface RouterContext {
  loginState: Promise<LoginState | undefined>;
  getPhoneCanvassCallerStore: () => PhoneCanvassCallerStore;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => {
    const context = Route.useRouteContext();
    const [loggedIn, setLoggedIn] = useState<boolean>(false);

    useEffect(() => {
      runPromise(
        (async (): Promise<void> => {
          setLoggedIn((await context.loginState)?.user !== undefined);
        })(),
        false,
      );
    }, [context.loginState]);
    const navBar = !loggedIn ? undefined : (
      <AppShell.Navbar p="md" mt="lg">
        <AppShell.Section grow component={ScrollArea}>
          <Stack>
            <RoutedLink to="/">Home</RoutedLink>
            <RoutedLink to="/PhoneCanvass/Create">
              Create Phone Canvass
            </RoutedLink>
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>
    );
    return (
      <MantineProvider>
        <HeadContent />
        <Notifications />

        <AppShell
          navbar={{
            width: 300,
            breakpoint: "sm",
          }}
          padding="md"
          mt="lg"
          withBorder={false}
        >
          <AppShell.Header
            pl={NAV_BAR_WIDTH}
            p="md"
            ml="md"
            style={{ position: "static" }}
          >
            <Title>Grassroots</Title>
          </AppShell.Header>
          {navBar}

          <AppShell.Main>
            <Outlet />
          </AppShell.Main>
          <DevTools></DevTools>
        </AppShell>
      </MantineProvider>
    );
  },
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
