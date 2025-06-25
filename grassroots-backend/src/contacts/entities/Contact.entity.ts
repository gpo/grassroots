import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsPhoneNumber,
  Min,
} from "class-validator";
import { Entity, PrimaryKey, Property, Unique } from "@mikro-orm/core";
import "reflect-metadata";

@Entity()
export class ContactEntity {
  @PrimaryKey()
  @IsInt()
  @Min(1)
  id!: number;

  @Property()
  @Unique()
  @IsEmail()
  email!: string;

  @Property()
  @IsNotEmpty()
  firstName!: string;

  @Property()
  @IsNotEmpty()
  lastName!: string;

  @Property()
  @IsPhoneNumber("CA")
  phoneNumber!: string;
}
