import { Entity, PrimaryKey, Property, Unique } from "@mikro-orm/core";
import "reflect-metadata";
import { ContactDTO } from "../../grassroots-shared/Contact.dto";
import { PropsOf } from "../../grassroots-shared/util/PropsOf";
import { AssertPropsEqual } from "../../grassroots-shared/util/AssertPropsEqual";

@Entity()
export class ContactEntity implements PropsOf<ContactDTO> {
  @PrimaryKey()
  id!: number;

  @Property()
  @Unique()
  email!: string;

  @Property()
  firstName!: string;

  @Property()
  lastName!: string;

  @Property()
  phoneNumber!: string;
}

export const check: AssertPropsEqual<ContactEntity, ContactDTO> = true;
