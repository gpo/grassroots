// eslint-disable-next-line check-file/filename-naming-convention, check-file/no-index
import { createFileRoute } from "@tanstack/react-router";
import { JSX, useContext, useState } from "react";
import {
  LoginState,
  LoginStateContext,
} from "../Features/Auth/Logic/LoginStateContext.js";

export const Route = createFileRoute("/")({
  component: Index,
  staticData: { isPublic: true },
});

function Index(): JSX.Element {
  const loginStatePromise = useContext(LoginStateContext);
  const [loginState, setLoginState] = useState<LoginState | undefined>(
    undefined,
  );

  loginStatePromise
    .then((v) => {
      setLoginState(v);
    })
    .catch((e: unknown) => {
      throw e;
    });
  return (
    <>
      <h1>Temporary auth tools</h1>
      <p>
        {loginState?.user ? (
          <button
            onClick={() => {
              void loginState.logout();
            }}
          >
            Logout {loginState.user.displayName ?? ""}
          </button>
        ) : (
          <a href="http://grassroots.org/api/auth/login">Login</a>
        )}
      </p>
      <p>TODO</p>
    </>
  );
}
