import "reflect-metadata";
import { Permission } from "./Permission";
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

export class RoleDTO {
  @IsNumber()
  @Min(0)
  id!: number;
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ValidateNested({ each: true })
  @IsEnum(Permission)
  permissions!: Permission[];
}
