import { Module } from "@nestjs/common";
import { UsersModule } from "../users/Users.module";
import { GoogleOAuthStrategy } from "./GoogleOAuth.strategy";
import { PassportModuleImport } from "./PassportModuleImport";
import { ConfigModule } from "@nestjs/config";
import { AuthController } from "./Auth.controller";
import { APP_GUARD } from "@nestjs/core";
import { SessionGuard } from "./Session.guard";
import { UsersService } from "../users/Users.service";
import { getEnvironmentVariables } from "../GetEnvironmentVariables";

@Module({
  providers: [
    // Use factory pattern for GoogleOAuthStrategy
    {
      provide: GoogleOAuthStrategy,
      useFactory: async (
        userService: UsersService,
      ): Promise<GoogleOAuthStrategy> => {
        const env = await getEnvironmentVariables();

        const clientId = env.GOOGLE_CLIENT_ID;
        const clientSecret = env.GOOGLE_CLIENT_SECRET;
        const callbackURL =
          env.GOOGLE_AUTH_CALLBACK_URL ?? "/auth/google/callback";

        if (clientId === undefined || clientId === "") {
          throw new Error("Missing environment variable GOOGLE_CLIENT_ID");
        }
        if (clientSecret === undefined || clientSecret === "") {
          throw new Error("Missing environment variable GOOGLE_CLIENT_SECRET");
        }

        return new GoogleOAuthStrategy(
          userService,
          clientId,
          clientSecret,
          callbackURL,
        );
      },
      inject: [UsersService],
    },
    // This pattern of providing this and then using useExisting is a bit weird, but required for
    // overriding the DefaultAuthGuard in tests.
    // https://stackoverflow.com/a/78448040
    SessionGuard,
    {
      provide: APP_GUARD,
      useExisting: SessionGuard,
    },
  ],
  imports: [UsersModule, PassportModuleImport(), ConfigModule],
  exports: [],
  controllers: [AuthController],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AuthModule {}
