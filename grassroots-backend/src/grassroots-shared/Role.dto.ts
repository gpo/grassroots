import "reflect-metadata";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { PermissionsDTO } from "./Permission.dto";

export class RoleDTO {
  @IsNumber()
  @Min(0)
  @IsOptional()
  id?: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PermissionsDTO)
  permissions?: PermissionsDTO;
}
