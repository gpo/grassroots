import { Module } from "@nestjs/common";
import { AuthService } from "./Auth.service";
import { UsersModule } from "../users/Users.module";
import { GoogleOAuthStrategy } from "./GoogleOAuth.strategy";
import { PassportModuleImport } from "./PassportModuleImport";

@Module({
  providers: [AuthService, GoogleOAuthStrategy],
  imports: [UsersModule, PassportModuleImport()],
  exports: [AuthService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AuthModule {}
