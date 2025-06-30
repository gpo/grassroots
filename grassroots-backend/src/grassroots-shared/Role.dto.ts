import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from "class-validator";
import "reflect-metadata";

export class RoleDTO {
  @IsNumber()
  @Min(1)
  id!: number;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsBoolean()
  canViewContacts!: boolean;

  @IsBoolean()
  canManageContacts!: boolean;

  @IsBoolean()
  canManageUsers!: boolean;
}
