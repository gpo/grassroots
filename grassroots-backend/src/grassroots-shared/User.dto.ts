import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { createBrandedClass } from "./util/CreateBrandedClass";
import { Type } from "class-transformer";

export class UserDTO extends createBrandedClass("UserDTO") {
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

export class UsersDTO extends createBrandedClass("UsersDTO") {
  @ValidateNested({ each: true })
  @Type(() => UserDTO)
  @IsArray()
  users!: UserDTO[];
}
