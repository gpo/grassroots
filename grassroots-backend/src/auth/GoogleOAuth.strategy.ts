import {
  Strategy as GoogleStrategy,
  VerifyCallback,
  VerifyFunction,
  Profile,
} from "passport-google-oidc";
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { UsersService } from "../users/Users.service";
import { UserDTO } from "../grassroots-shared/User.dto";

export const DEFAULT_PASSPORT_STRATEGY_NAME = "google";

@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(
  GoogleStrategy,
  DEFAULT_PASSPORT_STRATEGY_NAME,
) {
  constructor(
    private userService: UsersService,
    clientId: string,
    clientSecret: string,
    callbackURL: string,
  ) {
    super({
      clientID: clientId,
      clientSecret: clientSecret,
      callbackURL: callbackURL,
      scope: ["email", "profile"],
    });
  }

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
