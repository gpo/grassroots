import { IsEmail, IsString } from "class-validator";
import { Entity } from "typeorm";

@Entity()
export class UserEntity {
  @IsEmail()
  email!: string;
  @IsString()
  password!: string;
}
