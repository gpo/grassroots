import "reflect-metadata";
import { Permission } from "./Permission";
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
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

  @IsEnum(Permission, { each: true })
  @IsOptional()
  permissions?: Permission[];
}
