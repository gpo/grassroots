import {
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { createDTOBase } from "./util/CreateDTOBase.js";
import { Transform, Type } from "class-transformer";
import { UserRoleDTO } from "./UserRole.dto.js";

export class UserDTO extends createDTOBase("User") {
  @IsString()
  id!: string;

  @IsEmail({}, { each: true })
  @IsOptional()
  emails?: string[];

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => UserRoleDTO)
  userRoles?: UserRoleDTO[];
}

export class UserPermissionsForOrgRequestDTO extends createDTOBase(
  "UserPermissionsForOrgRequest",
) {
  @IsString()
  userId!: string;

  @IsNumber()
  @Min(1)
  @Transform(({ value }: { value: string }) => {
    return Number(value);
  })
  organizationId!: number;
}

export class UsersDTO extends createDTOBase("Users") {
  @ValidateNested({ each: true })
  @Type(() => UserDTO)
  @IsArray()
  users!: UserDTO[];
}
