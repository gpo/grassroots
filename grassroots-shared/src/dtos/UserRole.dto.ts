import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { RoleDTO } from "./Role.dto.js";
import { Transform, Type } from "class-transformer";
import { createDTOBase } from "../util/CreateDTOBase.js";

export class UserRoleDTO extends createDTOBase("UserRole") {
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Transform(({ value }: { value: string }) => {
    return Number(value);
  })
  id?: number;

  @IsString()
  @IsOptional()
  userId?: string;

  @Type(() => RoleDTO)
  @ValidateNested()
  role!: RoleDTO;

  @IsNumber()
  @Min(1)
  @Transform(({ value }: { value: string }) => {
    return Number(value);
  })
  organizationId!: number;

  @IsBoolean()
  inherited!: boolean;
}
