import {
  Strategy as GoogleStrategy,
  VerifyCallback,
  VerifyFunction,
  Profile,
} from "passport-google-oidc";
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { UsersService } from "../users/Users.service";
import OpenIDConnectStrategy from "passport-openidconnect";
import { UserDTO } from "../grassroots-shared/User.dto";
import { getEnvironmentVariables } from "../GetEnvironmentVariables";

export const DEFAULT_PASSPORT_STRATEGY_NAME = "google";

@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(
  GoogleStrategy,
  DEFAULT_PASSPORT_STRATEGY_NAME,
) {
  constructor(private userService: UsersService) {
    super({
      clientID: "temp",
      clientSecret: "temp",
      callbackURL: "temp",
      scope: ["email", "profile"],
    } satisfies Partial<OpenIDConnectStrategy.StrategyOptions>);
  }

  async onModuleInit(): Promise<void> {
    const envVars = await getEnvironmentVariables();

    const clientID = envVars.GOOGLE_CLIENT_ID;
    if (clientID === undefined) {
      throw new Error("Missing environment variable GOOGLE_CLIENT_ID");
    }
    const clientSecret = envVars.GOOGLE_CLIENT_SECRET;
    if (clientSecret === undefined) {
      throw new Error("Missing environment variable GOOGLE_CLIENT_SECRET");
    }
    const callbackURL = envVars.GOOGLE_AUTH_CALLBACK_URL;
    if (callbackURL === undefined) {
      throw new Error("Missing environment variable GOOGLE_AUTH_CALLBACK_URL");
    }

    // We need to access private properties - disable ESLint for these lines
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    (this as any)._oauth2._clientId = clientID;
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    (this as any)._oauth2._clientSecret = clientSecret;
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    (this as any)._callbackURL = callbackURL;
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
