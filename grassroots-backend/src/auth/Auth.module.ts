import { Module } from "@nestjs/common";
import { UsersModule } from "../users/Users.module.js";
import { GoogleOAuthStrategy } from "./GoogleOAuth.strategy.js";
import { PassportModuleImport } from "./PassportModuleImport.js";
import { AuthController } from "./Auth.controller.js";
import { APP_GUARD } from "@nestjs/core";
import { SessionGuard } from "./Session.guard.js";
import { OrganizationsModule } from "../organizations/Organizations.module.js";
import { UsersService } from "../users/Users.service.js";
import { getEnvVars } from "../GetEnvVars.js";

@Module({
  providers: [
    {
      provide: GoogleOAuthStrategy,
      useFactory: async (
        userService: UsersService,
      ): Promise<GoogleOAuthStrategy> => {
        return new GoogleOAuthStrategy(userService, await getEnvVars());
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
  imports: [UsersModule, OrganizationsModule, PassportModuleImport()],
  exports: [],
  controllers: [AuthController],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AuthModule {}
