import createFetchClient from "openapi-fetch";
import { paths } from "./grassroots-shared/openAPI.gen";

export const grassrootsAPI = createFetchClient<paths>({
  baseUrl: import.meta.env.VITE_BACKEND_HOST,
});
