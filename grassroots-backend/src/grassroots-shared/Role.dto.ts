import "reflect-metadata";
import { Permission, PermissionsDecorator } from "./Permission.dto";
import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";
import { createDTOBase } from "./util/CreateDTOBase";

export class RoleDTO extends createDTOBase<"RoleDTO">() {
  @IsNumber()
  @Min(0)
  id!: number;
  @IsString()
  @IsNotEmpty()
  name!: string;

  // eslint-disable-next-line @darraghor/nestjs-typed/all-properties-are-whitelisted, @darraghor/nestjs-typed/all-properties-have-explicit-defined
  @PermissionsDecorator()
  permissions!: Permission[];
}
