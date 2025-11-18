import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { JSX, StrictMode } from "react";
import { createRouter, RouterProvider } from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "../routeTree.gen.js";
import {
  getLoginState,
  LoginStateContext,
} from "../Features/Auth/Logic/LoginStateContext.js";
import { usePhoneCanvassCallerStore } from "../Features/PhoneCanvass/Logic/PhoneCanvassCallerStore.js";

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    loginState: Promise.resolve(undefined),
    getPhoneCanvassCallerStore: () => usePhoneCanvassCallerStore.getState(),
  },
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient();

export function App(): JSX.Element {
  const loginState = getLoginState();
  return (
    <StrictMode>
      <LoginStateContext.Provider value={loginState}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} context={{ loginState }} />
        </QueryClientProvider>
      </LoginStateContext.Provider>
    </StrictMode>
  );
}
