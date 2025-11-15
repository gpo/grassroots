// eslint-disable-next-line check-file/filename-naming-convention, check-file/no-index
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { JSX, useContext, useEffect, useState } from "react";
import {
  LoginState,
  LoginStateContext,
} from "../Features/Auth/Logic/LoginStateContext.js";
import { ErrorTexts } from "grassroots-shared/constants/ErrorTexts";
import { notifications } from "@mantine/notifications";
import { runPromise } from "grassroots-shared/util/RunPromise";

export const Route = createFileRoute("/")({
  component: Index,
  staticData: { isPublic: true },
  validateSearch: (
    search: Record<string, unknown>,
  ): { errorMessage: undefined | keyof typeof ErrorTexts } => {
    // TODO: validate.
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return { errorMessage: search.errorMessage as keyof typeof ErrorTexts };
  },
});

function Index(): JSX.Element {
  const loginStatePromise = useContext(LoginStateContext);
  const [loginState, setLoginState] = useState<LoginState | undefined>(
    undefined,
  );

  const [loginError, setLoginError] = useState<
    keyof typeof ErrorTexts | undefined
  >(undefined);

  const search = Route.useSearch();
  if (search.errorMessage !== loginError) {
    setLoginError(search.errorMessage);
  }
  const navigate = useNavigate();
  console.log("search", search);

  useEffect(() => {
    runPromise(
      (async (): Promise<void> => {
        if (loginError === undefined) {
          return;
        }

        console.log("GOING", loginError);
        notifications.clean();
        notifications.show({
          title: "Login failed",
          message: ErrorTexts[loginError],
          color: "red",
        });
        await navigate({});
      })(),
      false,
    );
  }, [loginError]);

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
