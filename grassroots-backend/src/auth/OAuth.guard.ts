import { AuthGuard } from "@nestjs/passport";
import { DEFAULT_PASSPORT_STRATEGY_NAME } from "./GoogleOAuth.strategy";
import { Injectable } from "@nestjs/common";

// Only used for OAuth to establish a session. The SessionGuard is responsible
// for API route authentication.
@Injectable()
export class OAuthGuard extends AuthGuard(DEFAULT_PASSPORT_STRATEGY_NAME) {}
