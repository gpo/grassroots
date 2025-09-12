import {
  Strategy as GoogleStrategy,
  VerifyCallback,
  VerifyFunction,
  Profile,
} from "passport-google-oidc";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { UsersService } from "../users/Users.service.js";
import OpenIDConnectStrategy from "passport-openidconnect";
import { UserDTO } from "grassroots-shared/dtos/User.dto";

export const DEFAULT_PASSPORT_STRATEGY_NAME = "google";

@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(
  GoogleStrategy,
  DEFAULT_PASSPORT_STRATEGY_NAME,
) {
  constructor(
    private config: ConfigService,
    private userService: UsersService,
  ) {
    const clientID = config.get<string>("GOOGLE_CLIENT_ID");
    if (clientID === undefined) {
      throw new Error("Missing environment variable GOOGLE_CLIENT_ID");
    }
    const clientSecret = config.get<string>("GOOGLE_CLIENT_SECRET");
    if (clientSecret === undefined) {
      throw new Error("Missing environment variable GOOGLE_CLIENT_SECRET");
    }
    const callbackURL = config.get<string>("GOOGLE_AUTH_CALLBACK_URL");
    if (callbackURL === undefined) {
      throw new Error("Missing environment variable GOOGLE_AUTH_CALLBACK_URL");
    }
    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ["email", "profile"],
    } satisfies Partial<OpenIDConnectStrategy.StrategyOptions>);
  }

  // TODO: eventually we shouldn't let anyone with a Google account login.
  validate: VerifyFunction = async (
    issuer: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> => {
    const id = profile.id;
    let user: UserDTO | undefined = undefined;
    try {
      user = await this.userService.findOrCreate(
        UserDTO.from({
          id,
          emails: profile.emails?.map((v) => v.value) ?? [],
          displayName: profile.displayName,
          firstName: profile.name?.givenName,
          lastName: profile.name?.familyName,
        }),
      );
      done(null, user);
    } catch (err) {
      let typedErr: undefined | Error = undefined;
      if (err instanceof Error) {
        typedErr = err;
      } else {
        typedErr = new Error(String(err));
      }
      done(typedErr);
    }
  };
}
