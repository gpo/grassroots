import { Module } from "@nestjs/common";
import { UsersService } from "./Users.service";
import { UserEntity } from "../grassroots-shared/User.entity";
import { MikroOrmModule } from "@mikro-orm/nestjs";

@Module({
  imports: [MikroOrmModule.forFeature([UserEntity])],
  providers: [UsersService],
  exports: [UsersService],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class UsersModule {}
