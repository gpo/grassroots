import {
  Strategy as GoogleStrategy,
  VerifyFunction,
  Profile,
} from "passport-google-oidc";
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { UsersService } from "../users/Users.service.js";
import OpenIDConnectStrategy from "passport-openidconnect";
import { UserDTO } from "grassroots-shared/dtos/User.dto";
import { Environment, getEnvVars } from "../GetEnvVars.js";
import { ErrorTexts } from "grassroots-shared/constants/ErrorTexts";

export const DEFAULT_PASSPORT_STRATEGY_NAME = "google";

export class GoogleOAuthStrategyValidateError extends Error {
  constructor(msg: string, errorMessage: keyof typeof ErrorTexts) {
    super(msg);
    this.errorMessage = errorMessage;
  }
  errorMessage: keyof typeof ErrorTexts;
}

@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(
  GoogleStrategy,
  DEFAULT_PASSPORT_STRATEGY_NAME,
) {
  constructor(
    private userService: UsersService,
    envVars: Environment,
  ) {
    super({
      clientID: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      callbackURL: envVars.GOOGLE_AUTH_CALLBACK_URL,
      scope: ["email", "profile"],
      prompt: "login",
    } satisfies Partial<OpenIDConnectStrategy.StrategyOptions>);
  }

  validate: VerifyFunction = async (
    issuer: string,
    profile: Profile,
  ): Promise<UserDTO | undefined> => {
    const id = profile.id;
    const emails = profile.emails?.map((v) => v.value) ?? [];

    const validEmailsRegex = (await getEnvVars()).VALID_LOGIN_EMAIL_REGEX;
    const validEmail = emails.find((email) => validEmailsRegex.match(email));

    if (validEmail === undefined) {
      throw new GoogleOAuthStrategyValidateError(
        ErrorTexts.EmailsMustBeGpo,
        "EmailsMustBeGpo",
      );
    }

    return await this.userService.findOrCreate(
      UserDTO.from({
        id,
        emails,
        displayName: profile.displayName,
        firstName: profile.name?.givenName,
        lastName: profile.name?.familyName,
      }),
    );
  };
}
