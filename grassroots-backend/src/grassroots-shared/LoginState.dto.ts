import { IsOptional, ValidateNested } from "class-validator";
import { UserEntity } from "./User.entity";
import { Type } from "class-transformer";

export class LoginStateDTO {
  @Type(() => UserEntity)
  @IsOptional()
  @ValidateNested()
  user?: UserEntity;
}
