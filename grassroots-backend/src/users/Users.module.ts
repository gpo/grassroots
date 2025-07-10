import { Module } from "@nestjs/common";
import { UsersService } from "./Users.service";
import { UserEntity } from "./User.entity";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { UsersController } from "./Users.controller";

@Module({
  imports: [MikroOrmModule.forFeature([UserEntity])],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class UsersModule {}
