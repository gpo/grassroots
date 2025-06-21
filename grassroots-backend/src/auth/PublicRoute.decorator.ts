import { CustomDecorator, SetMetadata } from "@nestjs/common";

export const DECORATOR_METADATA_INDICATING_PUBLIC_ROUTE = Symbol("isPublic");
export const PublicRoute = (): CustomDecorator<symbol> =>
  SetMetadata(DECORATOR_METADATA_INDICATING_PUBLIC_ROUTE, true);
