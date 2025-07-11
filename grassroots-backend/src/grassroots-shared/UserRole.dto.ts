import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { RoleDTO } from "./Role.dto";
import { Type } from "class-transformer";

export class UserRoleDTO {
  @IsNumber()
  @Min(1)
  @IsOptional()
  id?: number;

  @IsString()
  @IsOptional()
  userId?: string;

  @Type(() => RoleDTO)
  @ValidateNested()
  role!: RoleDTO;

  @IsNumber()
  @Min(1)
  organizationId!: number;

  @IsBoolean()
  inherited!: boolean;
}
