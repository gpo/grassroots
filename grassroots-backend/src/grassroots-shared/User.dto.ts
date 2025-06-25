import { IsEmail, IsOptional, IsString } from "class-validator";

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
