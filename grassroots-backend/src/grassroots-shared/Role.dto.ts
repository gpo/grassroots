import "reflect-metadata";
import { Permission } from "./Permission";
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

export class RoleDTO {
  @IsNumber()
  @Min(0)
  @IsOptional()
  id?: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ValidateNested({ each: true })
  @IsEnum(Permission)
  @IsOptional()
  permissions?: Permission[];
}
