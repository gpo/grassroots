import { IsEnum } from "class-validator";
import { Permission, PermissionValue } from "./Permission";
import { ApiProperty } from "@nestjs/swagger";

export class PermissionsDTO {
  @IsEnum(Permission)
  @ApiProperty({ enum: Permission, isArray: true })
  // We use PermissionValue here instead of Permission, because it allows the values returned
  // by the typescript OpenAPI wrapper to adhere to this type.
  permissions!: PermissionValue[];
}
