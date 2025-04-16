import { BACKEND_HOST, FRONTEND_HOST } from "./local-constants";

export const SUPERTOKENS_APPINFO = {
  // learn more about this on https://supertokens.com/docs/references/frontend-sdks/reference#sdk-configuration
  appName: "grassroots",
  apiDomain: BACKEND_HOST,
  websiteDomain: FRONTEND_HOST,
  apiBasePath: "/auth",
  websiteBasePath: "/auth",
};
