import { Module } from "@nestjs/common";
import { UsersModule } from "../users/Users.module";
import { GoogleOAuthStrategy } from "./GoogleOAuth.strategy";
import { PassportModuleImport } from "./PassportModuleImport";
import { ConfigModule } from "@nestjs/config";
import { AuthController } from "./Auth.controller";
import { APP_GUARD } from "@nestjs/core";
import { DefaultAuthGuard } from "./DefaultAuth.guard";

@Module({
  providers: [
    GoogleOAuthStrategy,
    // This pattern of providing this and then using useExisting is a bit weird, but required for
    // overriding the DefaultAuthGuard in tests.
    // https://stackoverflow.com/a/78448040
    DefaultAuthGuard,
    {
      provide: APP_GUARD,
      useExisting: DefaultAuthGuard,
    },
  ],
  imports: [UsersModule, PassportModuleImport(), ConfigModule],
  exports: [],
  controllers: [AuthController],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AuthModule {}
