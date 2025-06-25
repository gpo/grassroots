import { AuthGuard } from "@nestjs/passport";
import { DEFAULT_PASSPORT_STRATEGY_NAME } from "./GoogleOAuth.strategy";
import { ExecutionContext, Injectable } from "@nestjs/common";
import { GrassrootsRequest } from "../types/GrassrootsRequest";
import { Observable } from "rxjs";

// Only used for OAuth to establish a session. The SessionGuard is responsible
// for API route authentication.
@Injectable()
export class OAuthGuard extends AuthGuard(DEFAULT_PASSPORT_STRATEGY_NAME) {
  canActivate(
    context: ExecutionContext,
  ): Promise<boolean> | Observable<boolean> | boolean {
    const req = context.switchToHttp().getRequest<GrassrootsRequest>();

    // This is set in the login route.
    const redirectPathParam = req.query.redirect_path;
    if (
      redirectPathParam !== undefined &&
      typeof redirectPathParam === "string"
    ) {
      const redirectPath: string = redirectPathParam;
      req.session.redirect_path = redirectPath;
    }

    return super.canActivate(context);
  }
}
