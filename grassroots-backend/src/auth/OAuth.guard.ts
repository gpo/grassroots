import { AuthGuard } from "@nestjs/passport";
import {
  DEFAULT_PASSPORT_STRATEGY_NAME,
  GoogleOAuthStrategyValidateError,
} from "./GoogleOAuth.strategy.js";
import { ExecutionContext, Injectable } from "@nestjs/common";
import type { GrassrootsRequest } from "../../types/GrassrootsRequest.js";
import { Observable } from "rxjs";

// Only used for OAuth to establish a session. The SessionGuard is responsible
// for API route authentication.
@Injectable()
export class OAuthGuard extends AuthGuard(DEFAULT_PASSPORT_STRATEGY_NAME) {
  canActivate(
    context: ExecutionContext,
  ): Promise<boolean> | Observable<boolean> | boolean {
    console.log("GUARD");
    const req = context.switchToHttp().getRequest<GrassrootsRequest>();

    // This is set in the login route.
    const redirectPath = req.query.redirect_path;
    if (typeof redirectPath === "string") {
      req.session.redirect_path = redirectPath;
    }
    console.log("GUARD CALLING SUPER");

    return super.canActivate(context);
  }

  handleRequest<UserDTO>(
    err: GoogleOAuthStrategyValidateError | undefined,
    user: UserDTO | false,
    info: unknown,
    context: ExecutionContext,
  ): UserDTO | null {
    console.log("HANDLE REQUEST", err, user);
    if (err || user === false) {
      console.log("ERROR!");
      const request = context.switchToHttp().getRequest<GrassrootsRequest>();
      if (err?.errorMessage) {
        request.session.redirect_path = "/?errorMessage=" + err.errorMessage;
      } else {
        request.session.redirect_path = "/?errorMessage=Unauthorized";
      }
      console.log("HANDLE REQUEST SET REDIRECT PATH");

      return null;
    }

    return user;
  }
}
