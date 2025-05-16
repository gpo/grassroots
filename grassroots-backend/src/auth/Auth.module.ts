import { Module } from "@nestjs/common";
import { AuthService } from "./Auth.service";
import { UsersModule } from "../users/Users.module";

@Module({
  providers: [AuthService],
  imports: [UsersModule],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AuthModule {}
