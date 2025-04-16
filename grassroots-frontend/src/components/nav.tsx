import { Link } from "@tanstack/react-router";

import "./Nav.css";
import { JSX } from "react";
import { grassrootsAPI } from "../grassrootsAPI";
import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";

function onLogout(): void {
  // eslint-disable-next-line @typescript-eslint/require-await
  void (async (): Promise<void> => {
    console.log("Logging out.");
    //await signOut();
    window.location.href = "/auth"; // or redirect to wherever the login page is
  })();
}

function useCreateFakeContacts(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (count: number) => {
      await grassrootsAPI.POST("/contacts/add-fakes/{count}", {
        params: {
          path: {
            count,
          },
        },
      });
    },
    retry: 1,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

export function Nav(): JSX.Element {
  /*const session = useSessionContext();
  const loggedIn = false;
  if (!session.loading) {
    loggedIn = session.doesSessionExist;
  }
  console.log('Logged in?', loggedIn);*/

  const { mutateAsync } = useCreateFakeContacts();

  return (
    <ul id="nav" style={{ paddingRight: "1em" }}>
      <li>
        <Link to="/">Home</Link>
      </li>
      <li>
        <Link to="/create-contact">New Contact</Link>
      </li>
      <li>
        <Link to="/search">Search</Link>
      </li>
      <li>
        <button
          onClick={() => {
            void (async (): Promise<void> => {
              await mutateAsync(100);
            })();
          }}
        >
          Add 100 fake contacts.
        </button>
      </li>
      <li id="logout" onClick={onLogout} style={{ display: "none" }}>
        <button>Logout</button>
      </li>
    </ul>
  );
}
