import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from "@mikro-orm/core";
import { OrganizationDTO } from "../grassroots-shared/Organization.dto.js";
import { createEntityBase } from "../util/CreateEntityBase.js";
import { ContactEntity } from "../contacts/entities/Contact.entity.js";
import { OrganizationRepository } from "./Organization.repo.js";

@Entity({ repository: () => OrganizationRepository })
export class OrganizationEntity extends createEntityBase<
  "Organization",
  OrganizationDTO
>("Organization") {
  [EntityRepositoryType]?: OrganizationRepository;

  @PrimaryKey({ autoincrement: true })
  id!: number;

  @Property()
  @Unique()
  name!: string;

  @Property()
  @Unique()
  abbreviatedName!: string;

  @Property()
  description!: string;

  @ManyToOne(() => OrganizationEntity, {
    nullable: true,
  })
  parent?: OrganizationEntity;

  @OneToMany(() => OrganizationEntity, (organization) => organization.parent)
  children = new Collection<OrganizationEntity>(this);

  @OneToMany(() => ContactEntity, (contact) => contact.organization)
  contacts = new Collection<typeof ContactEntity>(this);

  toDTO(): OrganizationDTO {
    return OrganizationDTO.from({
      id: this.id,
      name: this.name,
      abbreviatedName: this.abbreviatedName,
      description: this.description,
      parentId: this.parent?.id,
    });
  }
}
