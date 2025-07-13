import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { UserRoleDTO } from "./UserRole.dto";

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

  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => UserRoleDTO)
  userRoles?: UserRoleDTO[];
}

export class UserPermissionsForOrgRequestDTO {
  @IsString()
  userId!: string;

  @IsNumber()
  @Min(1)
  @Transform(({ value }: { value: string }) => {
    return Number(value);
  })
  organizationId!: number;
}
