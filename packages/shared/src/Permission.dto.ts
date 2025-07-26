import { IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { applyDecorators } from "@nestjs/common";
import { createDTOBase } from "./src/util/CreateDTOBase";

// This enum is only used for generating OpenAPI docs.
// See PermissionsDecorator.
enum PermissionEnum {
  VIEW_CONTACTS = "VIEW_CONTACTS",
  MANAGE_CONTACTS = "MANAGE_CONTACTS",
  MANAGE_USERS = "MANAGE_USERS",
}

export type Permission = keyof typeof PermissionEnum;

export function PermissionsDecorator(): PropertyDecorator {
  return applyDecorators(
    IsEnum(PermissionEnum),
    ApiProperty({ enum: PermissionEnum, isArray: true }),
  );
}

export class PermissionsDTO extends createDTOBase("Permissions") {
  @PermissionsDecorator()
  permissions!: Permission[];
}
