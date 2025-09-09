import { Module } from "@nestjs/common";
import { UsersService } from "./Users.service.js";
import { UserEntity } from "./User.entity.js";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { UsersController } from "./Users.controller.js";

@Module({
  imports: [MikroOrmModule.forFeature([UserEntity])],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class UsersModule {}
