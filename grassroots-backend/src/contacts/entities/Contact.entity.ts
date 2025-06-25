import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsPhoneNumber,
  Min,
} from "class-validator";
import { Entity, PrimaryKey, Property, Unique } from "@mikro-orm/core";
import "reflect-metadata";
import { ContactResponseDTO } from "../../grassroots-shared/Contact.dto";
import { PropsOf } from "../../grassroots-shared/Cast";

@Entity()
export class ContactEntity implements PropsOf<ContactResponseDTO> {
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
