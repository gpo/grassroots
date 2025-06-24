import createFetchClient from "openapi-fetch";
import { paths } from "./grassroots-shared/OpenAPI.gen";

export const grassrootsAPI = createFetchClient<paths>({
  baseUrl: import.meta.env.VITE_BACKEND_HOST,
});

type PathsWithGet = {
  [K in keyof paths]: paths[K]["get"] extends never ? never : K;
}[keyof paths];

type PathsAndQueryParamsWithGet = {
  [K in PathsWithGet]: paths[K]["parameters"] extends { query?: infer Q }
    ? Q
    : undefined;
};

export function navigateToBackendRoute(
  path: PathsWithGet,
  queryParams: number,
): void {
  window.location.href = path;
}
