import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { IsEmail, IsOptional, IsString } from "class-validator";

@Entity()
export class UserEntity {
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
