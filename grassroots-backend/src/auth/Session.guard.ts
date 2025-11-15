import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { DECORATOR_METADATA_INDICATING_PUBLIC_ROUTE } from "./PublicRoute.decorator.js";
import { GrassrootsRequest } from "../../types/GrassrootsRequest.js";
import { UserDTO } from "grassroots-shared/dtos/User.dto";

@Injectable()
export class SessionGuard {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    console.log("CAN ACTIVATE in Session guard");
    const isRoutePublic = this.reflector.getAllAndOverride<boolean>(
      DECORATOR_METADATA_INDICATING_PUBLIC_ROUTE,
      [context.getHandler(), context.getClass()],
    );

    if (isRoutePublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<GrassrootsRequest>();

    if (!request.user) {
      throw new UnauthorizedException("Login required");
    }

    return true;
  }

  handleRequest(
    err: Error | undefined,
    user: UserDTO | undefined,
    info: unknown,
    context: ExecutionContext,
  ): UserDTO | null {
    if (err || !user) {
      const request = context.switchToHttp().getRequest<GrassrootsRequest>();
      request.session.redirect_path = "/?errorMessage=EmailsMustBeGpo";
      return null;
    }

    return user;
  }
}
