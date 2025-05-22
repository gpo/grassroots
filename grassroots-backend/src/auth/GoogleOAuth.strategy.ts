import { Strategy as LocalStrategy } from "passport-local";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./Auth.service";
import { UserEntity } from "../grassroots-shared/User.entity";
import { PassportStrategy } from "@nestjs/passport";

// This doesn't work if set to "default".
export const DEFAULT_PASSPORT_STRATEGY_NAME = "temporaryLocalStrategy";

// TODO: switch to OAuth.
@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(
  LocalStrategy,
  DEFAULT_PASSPORT_STRATEGY_NAME,
) {
  constructor(private authService: AuthService) {
    super({ usernameField: "email" });
  }

  async validate(email: string, password: string): Promise<UserEntity | null> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
