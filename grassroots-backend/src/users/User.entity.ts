import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { IsEmail, IsOptional, IsString } from "class-validator";
import { PropsOf } from "../grassroots-shared/Cast";
import { UserDTO } from "../grassroots-shared/User.dto";

@Entity()
export class UserEntity implements PropsOf<UserDTO> {
  @IsString()
  @PrimaryKey()
  id!: string;
  @IsEmail({}, { each: true })
  @IsOptional()
  @Property({ type: "json", nullable: true })
  emails?: string[];
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
