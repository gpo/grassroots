import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from "@mikro-orm/core";
import type { Rel, RequiredEntityData } from "@mikro-orm/core";
import {
  ContactDTO,
  CreateContactRequestDTO,
} from "grassroots-shared/dtos/Contact.dto";
import { createEntityBase } from "../../util/CreateEntityBase.js";
import { OrganizationEntity } from "../../organizations/Organization.entity.js";

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
  organization!: Rel<OrganizationEntity>;

  toDTO(): ContactDTO {
    return ContactDTO.from({
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber,
      organization: this.organization.toDTO(),
    });
  }

  static fromCreateContactRequestDTO(
    contact: CreateContactRequestDTO,
  ): RequiredEntityData<ContactEntity> {
    return {
      email: contact.email,
      firstName: contact.firstName,
      lastName: contact.lastName,
      phoneNumber: contact.phoneNumber,
      organization: contact.organizationId,
    };
  }
}
