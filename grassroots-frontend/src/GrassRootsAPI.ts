import createFetchClient from "openapi-fetch";
import { paths } from "./grassroots-shared/OpenAPI.gen";

export const grassrootsAPI = createFetchClient<paths>({
  baseUrl: import.meta.env.VITE_BACKEND_HOST,
  //requestInitExt: { credentials: "same-origin" },
});
