import { Module } from "@nestjs/common";
import { UsersModule } from "../users/Users.module";
import { GoogleOAuthStrategy } from "./GoogleOAuth.strategy";
import { PassportModuleImport } from "./PassportModuleImport";
import { ConfigModule } from "@nestjs/config";
import { AuthController } from "./Auth.controller";

@Module({
  providers: [GoogleOAuthStrategy],
  imports: [UsersModule, PassportModuleImport(), ConfigModule],
  exports: [],
  controllers: [AuthController],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AuthModule {}
