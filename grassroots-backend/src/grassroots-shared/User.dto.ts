import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { Permission } from "./Permission";

export class UserDTO {
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
}

export class UserPermissionsForOrgRequestDTO {
  @IsString()
  userId!: string;

  @IsNumber()
  @Min(1)
  organizationId!: number;
}

export class PermissionsDTO {
  @ValidateNested({ each: true })
  @IsEnum(Permission)
  permissions!: Permission[];
}
