import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from "@mikro-orm/core";
import "reflect-metadata";
import { ContactDTO } from "../../grassroots-shared/Contact.dto";
import { createEntityBase } from "../../util/CreateEntityBase";
import { OrganizationEntity } from "../../organizations/Organization.entity";

@Entity()
export class ContactEntity extends createEntityBase<"Contact", ContactDTO>(
  "Contact",
) {
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

  @ManyToOne(() => OrganizationEntity)
  organization!: OrganizationEntity;

  toDTO(): ContactDTO {
    return ContactDTO.from({
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber,
      organization: this.organization,
    });
  }
}
