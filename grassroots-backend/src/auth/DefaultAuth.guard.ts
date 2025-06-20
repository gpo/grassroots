import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { DEFAULT_PASSPORT_STRATEGY_NAME } from "./GoogleOAuth.strategy";
import { Reflector } from "@nestjs/core";
import { DECORATOR_METADATA_INDICATING_PUBLIC_ROUTE } from "./PublicRoute.decorator";
import { Observable } from "rxjs";

// Wraps the passport auth guard, and pays attention to the PublicRoute decorator.
@Injectable()
export class DefaultAuthGuard extends AuthGuard(
  DEFAULT_PASSPORT_STRATEGY_NAME,
) {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isRoutePublic = this.reflector.getAllAndOverride<boolean>(
      DECORATOR_METADATA_INDICATING_PUBLIC_ROUTE,
      [context.getHandler(), context.getClass()],
    );
    console.log("CanActivate");
    if (isRoutePublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest<UserEntity>(
    err: unknown,
    user: UserEntity | false | undefined,
    info: unknown,
    context: ExecutionContext,
  ): UserEntity | false | undefined {
    console.log("handleRequest", user);
    const request: Request = context.switchToHttp().getRequest();

    if (user === false || user === undefined) {
      if (request.method !== "GET") {
        throw new UnauthorizedException();
      }
    }

    return super.handleRequest(err, user, info, context);
  }
}
