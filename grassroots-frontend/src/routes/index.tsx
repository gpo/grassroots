/* eslint-disable check-file/no-index */
import { createFileRoute } from "@tanstack/react-router";
import { JSX } from "react";
import { useLoginState } from "../hooks/useLoginState";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index(): JSX.Element {
  const { isLoggedInQueryResult: isLoggedIn, logout } = useLoginState();
  return (
    <>
      <h1>Temporary auth tools</h1>
      <p>
        {isLoggedIn.data?.isLoggedIn == true ? (
          <button
            onClick={() => {
              void logout();
            }}
          >
            Logout {isLoggedIn.data.user?.displayName ?? ""}
          </button>
        ) : (
          <a href="http://grassroots.org/api/auth/login">Login</a>
        )}
      </p>
      <p>TODO</p>
    </>
  );
}
