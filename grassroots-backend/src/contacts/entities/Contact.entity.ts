import {
  Entity,
  ManyToOne,
  OptionalProps,
  PrimaryKey,
  Property,
  Rel,
  Unique,
} from "@mikro-orm/core";
import "reflect-metadata";
import { ContactDTO } from "grassroots-shared/Contact.dto";
import { createEntityBase } from "../../util/CreateEntityBase";
import { OrganizationEntity } from "../../organizations/Organization.entity";

@Entity()
export class ContactEntity extends createEntityBase<"Contact", ContactDTO>(
  "Contact",
) {
  [OptionalProps]?: "organizationId";

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

  @ManyToOne(() => OrganizationEntity, { joinColumn: "organizationId" })
  organization!: Rel<OrganizationEntity>;

  get organizationId(): number {
    return this.organization.id;
  }

  toDTO(): ContactDTO {
    return ContactDTO.from({
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber,
      organization: this.organization.toDTO(),
      organizationId: this.organizationId,
    });
  }
}
