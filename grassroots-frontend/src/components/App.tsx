import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { JSX, StrictMode } from "react";
import { useLoginState } from "../hooks/useLoginState";
import { createRouter, RouterProvider } from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "../routeTree.gen";

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    loginState: undefined,
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
  const loginState = useLoginState(queryClient);
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} context={{ loginState }} />
      </QueryClientProvider>
    </StrictMode>
  );
}
