import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { DECORATOR_METADATA_INDICATING_PUBLIC_ROUTE } from "./PublicRoute.decorator";
import { GrassrootsRequest } from "../types/GrassrootsRequest";
import { DECORATOR_METADATA_INDICATING_OAUTH_ROUTE } from "./OAuthRoute.decorator";

@Injectable()
export class SessionGuard {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isRoutePublic = this.reflector.getAllAndOverride<boolean>(
      DECORATOR_METADATA_INDICATING_PUBLIC_ROUTE,
      [context.getHandler(), context.getClass()],
    );

    const isOAuthRoute = this.reflector.getAllAndOverride<boolean>(
      DECORATOR_METADATA_INDICATING_OAUTH_ROUTE,
      [context.getHandler(), context.getClass()],
    );

    if (isRoutePublic || isOAuthRoute) {
      return true;
    }

    const request = context.switchToHttp().getRequest<GrassrootsRequest>();

    if (!request.user) {
      throw new UnauthorizedException("Login required");
    }

    return true;
  }
}
