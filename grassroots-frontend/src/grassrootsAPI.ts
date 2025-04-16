import createFetchClient from "openapi-fetch";
import { paths } from "./grassroots-shared/openAPI";

import { BACKEND_HOST } from "./grassroots-shared/local-constants";

export const grassrootsAPI = createFetchClient<paths>({
  baseUrl: BACKEND_HOST,
});
