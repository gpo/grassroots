import { Permission, PermissionsDecorator } from "./Permission.dto.js";
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { createDTOBase } from "../util/CreateDTOBase.js";
import { Type } from "class-transformer";

export class RoleDTO extends createDTOBase("Role") {
  @IsNumber()
  @Min(2)
  id!: number;

  @IsString()
  @IsNotEmpty()
  name!: string;

  // eslint-disable-next-line @darraghor/nestjs-typed/all-properties-are-whitelisted, @darraghor/nestjs-typed/all-properties-have-explicit-defined
  @PermissionsDecorator()
  permissions!: Permission[];
}

export class RolesDTO extends createDTOBase("Roles") {
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => RoleDTO)
  roles!: RoleDTO[];
}
