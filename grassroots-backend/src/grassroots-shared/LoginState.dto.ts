import { IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { UserDTO } from "./User.dto";
import { createDTOBase } from "./util/CreateDTOBase";

export class LoginStateDTO extends createDTOBase("LoginState") {
  @Type(() => UserDTO)
  @IsOptional()
  @ValidateNested()
  user?: UserDTO;
}
