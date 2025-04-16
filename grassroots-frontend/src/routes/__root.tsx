import SuperTokens from "supertokens-auth-react";
import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import Session from "supertokens-auth-react/recipe/session";
import { SUPERTOKENS_APPINFO } from "../grassroots-shared/supertokens-appinfo";

console.log("INIT");
SuperTokens.init({
  appInfo: SUPERTOKENS_APPINFO,
  enableDebugLogs: true,
  recipeList: [
    Session.init({
      // Third party cookie deprecation requires this approach.
      // https://supertokens.com/docs/post-authentication/session-management/switch-between-cookies-and-header-authentication
      tokenTransferMethod: "header",
    }),
    EmailPassword.init(),
  ],
});
console.log("DONE INIT");

//const userId = await Session.getUserId();
//console.log('userID', userId);

//console.log('Access Token', await Session.getAccessToken());

import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { Nav } from "../components/nav";

console.log("About to import tanstack query");
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
console.log("Done import of tanstack query");

import "./Root.css";

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: () => {
    return (
      <div id="root">
        {/*<SuperTokensWrapper>*/}
        <QueryClientProvider client={queryClient}>
          <Nav></Nav>
          <div id="outlet">
            <Outlet />
          </div>
          <TanStackRouterDevtools />
        </QueryClientProvider>
        {/*</SuperTokensWrapper>*/}
      </div>
    );
  },
});
