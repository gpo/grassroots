import { Module } from "@nestjs/common";
import { UsersService } from "./Users.service";

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class UsersModule {}
