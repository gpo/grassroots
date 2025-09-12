import createClient from "openapi-fetch";
import { paths } from "grassroots-shared/OpenAPI.gen.js";
import { redirect } from "@tanstack/react-router";

export const grassrootsAPI = createClient<paths>({
  baseUrl: import.meta.env.VITE_BACKEND_HOST,
});

// We want to allow typesafe navigation to backend routes.
// This is a bit over the top, but does give us what we want!
type PathsWithGetMap = {
  // For each key, if `get` is undefined, remove the key.
  [K in keyof paths]: paths[K]["get"] extends undefined
    ? never
    : {
        // Otherwise, use this type.
        path: K;
        // Use the type of query if it exists. Otherwise, use the "never" type.
        query: paths[K]["get"] extends { parameters: { query: infer Q } }
          ? Q
          : never;
      };
};

type QueryRecord = Record<string, string>;

// With this approach, you need to explicitly pass a query of undefined. We could get around that,
// but this is already complicated enough.
export function navigateToBackendRoute<
  T extends keyof PathsWithGetMap,
  // Infer the type of query.
  Q extends PathsWithGetMap[T] extends { query: infer QQ } ? QQ : undefined,
  // If query doesn't extend Record<string, string>, we can't use it here, so we map it to undefined.
>(pathUntyped: T, query: Q extends QueryRecord ? Q : undefined): void {
  // Typescript can't tell that T will always be a string, so we have to tell it.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  let path = pathUntyped as string;

  if (query !== undefined) {
    path = "api" + path + "?" + new URLSearchParams(query).toString();
  }

  // Use a tanstack router redirect to avoid races.
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  throw redirect({
    href: path,
    reloadDocument: true,
  });
}
