import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { createDTOBase } from "./util/CreateDTOBase";
import { Type } from "class-transformer";

export class UserDTO extends createDTOBase<"UserDTO">() {
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

export class UsersDTO extends createDTOBase<"UsersDTO">() {
  @ValidateNested({ each: true })
  @Type(() => UserDTO)
  @IsArray()
  users!: UserDTO[];
}
