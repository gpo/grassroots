import { IsEmail, IsOptional, IsString } from "class-validator";
import { createBrandedClass } from "./util/CreateBrandedClass";

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
