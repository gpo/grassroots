import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { DEFAULT_PASSPORT_STRATEGY_NAME } from "./GoogleOAuth.strategy";

@Injectable()
export class DefaultAuthGuard extends AuthGuard(
  DEFAULT_PASSPORT_STRATEGY_NAME,
) {}
