import { Entity, PrimaryKey } from "@mikro-orm/core";
import { IsEmail, IsString } from "class-validator";

@Entity()
export class UserEntity {
  @PrimaryKey()
  @IsEmail()
  email!: string;
  @IsString()
  password!: string;
}
