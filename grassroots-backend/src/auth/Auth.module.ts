import { Module } from "@nestjs/common";
import { UsersModule } from "../users/Users.module.js";
import { GoogleOAuthStrategy } from "./GoogleOAuth.strategy.js";
import { PassportModuleImport } from "./PassportModuleImport.js";
import { ConfigModule } from "@nestjs/config";
import { AuthController } from "./Auth.controller.js";
import { APP_GUARD } from "@nestjs/core";
import { SessionGuard } from "./Session.guard.js";
import { OrganizationsModule } from "../organizations/Organizations.module.js";

import { MockSessionGuard } from "../testing/MockAuthGuard";

console.log(process.env.NODE_ENV);

@Module({
  providers: [
    GoogleOAuthStrategy,
    // This pattern of providing this and then using useExisting is a bit weird, but required for
    // overriding the DefaultAuthGuard in tests.
    // https://stackoverflow.com/a/78448040
    {
      provide: SessionGuard,
      useClass:
        process.env.NODE_ENV === "development"
          ? MockSessionGuard
          : SessionGuard,
    },
    // SessionGuard,
    {
      provide: APP_GUARD,
      useExisting: SessionGuard,
    },
  ],
  imports: [
    UsersModule,
    OrganizationsModule,
    PassportModuleImport(),
    ConfigModule,
  ],
  exports: [],
  controllers: [AuthController],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AuthModule {}
