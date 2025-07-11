import {
  IsBoolean,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { RoleDTO } from "./Role.dto";
import { Type } from "class-transformer";

export class UserRoleDTO {
  @IsNumber()
  @Min(1)
  id!: number;

  @IsString()
  userId!: string;

  @Type(() => RoleDTO)
  @ValidateNested()
  role!: RoleDTO;

  @IsNumber()
  @Min(1)
  organizationId!: number;

  @IsBoolean()
  inherited!: boolean;
}
