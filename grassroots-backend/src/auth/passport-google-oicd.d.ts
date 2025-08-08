/* eslint-disable check-file/filename-naming-convention */

module "passport-google-oidc" {
  import type {
    OpenIDConnectStrategy,
    VerifyFunction as PassportVerifyFunction,
    VerifyCallback as PassportVerifyCallback,
    Profile as PassportProfile,
  } from "passport-openidconnect";

  export const Strategy: typeof OpenIDConnectStrategy;
  export type VerifyFunction = PassportVerifyFunction;
  export type VerifyCallback = PassportVerifyCallback;
  export type Profile = PassportProfile;
}
