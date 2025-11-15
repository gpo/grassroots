import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
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

  @Property({ nullable: true })
  gvote_id?: string;

  @Property()
  email!: string;

  @Property()
  firstName!: string;

  @Property({ nullable: true })
  middleName?: string;

  @Property()
  lastName!: string;

  @Property()
  phoneNumber!: string;

  //@Property()
  //address!: string;

  @ManyToOne(() => OrganizationEntity)
  organization!: Rel<OrganizationEntity>;

  toDTO(): ContactDTO {
    return ContactDTO.from({
      id: this.id,
      gvote_id: this.gvote_id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber,
      organization: this.organization,
    });
  }

  static fromCreateContactRequestDTO(
    contact: CreateContactRequestDTO,
  ): RequiredEntityData<ContactEntity> {
    return {
      email: contact.email,
      gvote_id: contact.gvote_id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      phoneNumber: contact.phoneNumber,
      organization: contact.organizationId,
    };
  }
}
