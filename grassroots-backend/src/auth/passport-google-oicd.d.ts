/* eslint-disable check-file/filename-naming-convention */

declare module "passport-google-oidc" {
  import type {
    OpenIDConnectStrategy,
    VerifyFunction,
    VerifyCallback,
    Profile,
  } from "passport-openidconnect";

  export const Strategy: OpenIDConnectStrategy;
  export type VerifyFunction = (
    issuer: string,
    profile: Profile,
    done: VerifyCallback,
  ) => void;
  export type VerifyCallback = VerifyCallback;
  export type Profile = Profile;
}
