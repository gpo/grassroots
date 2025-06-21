import { CustomDecorator, SetMetadata } from "@nestjs/common";

// Used to disable the session guard for routes relates to OAuth signing.
export const DECORATOR_METADATA_INDICATING_OAUTH_ROUTE = Symbol("isOAuth");
export const OAuthRoute = (): CustomDecorator<symbol> =>
  SetMetadata(DECORATOR_METADATA_INDICATING_OAUTH_ROUTE, true);
