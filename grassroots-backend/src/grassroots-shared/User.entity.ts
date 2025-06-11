import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { IsEmail, IsOptional, IsString } from "class-validator";

@Entity()
export class UserEntity {
  @PrimaryKey()
  @IsEmail()
  email!: string;
  @IsString()
  @IsOptional()
  @Property({ nullable: true })
  firstName?: string;
  @IsString()
  @IsOptional()
  @Property({ nullable: true })
  lastName?: string;
  @IsString()
  @IsOptional()
  @Property({ nullable: true })
  displayName?: string;
}
