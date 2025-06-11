import { IsBoolean, IsOptional, ValidateNested } from "class-validator";
import { UserEntity } from "./User.entity";
import { Type } from "class-transformer";

export class LoginStateDTO {
  @IsBoolean()
  isLoggedIn!: boolean;
  @Type(() => UserEntity)
  @IsOptional()
  @ValidateNested()
  user?: UserEntity;
}
