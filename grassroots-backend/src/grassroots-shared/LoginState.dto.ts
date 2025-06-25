import { IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { UserDTO } from "./User.dto";

export class LoginStateDTO {
  @Type(() => UserDTO)
  @IsOptional()
  @ValidateNested()
  user?: UserDTO;
}
