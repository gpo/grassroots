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

  @Property({ nullable: true })
  @Unique()
  gvote_id?: string;

  @Property()
  @Unique()
  email!: string;

  @Property()
  firstName!: string;

  @Property({ nullable: true })
  middleName?: string;

  @Property()
  lastName!: string;

  @Property()
  phoneNumber!: string;

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
      // Organization will always be defined in the database, but won't always be populated.
      // It might be better to defined toDTO on Loaded<Entity>'s, but that's a bit tricky.
      // See https://github.com/gpo/grassroots/issues/228.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      organization: this.organization?.toDTO(),
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
