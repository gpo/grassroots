import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToOne,
  MikroORM,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from "@mikro-orm/core";
import {
  OrganizationDTO,
  ROOT_ORGANIZATION_ID,
} from "grassroots-shared/dtos/Organization.dto";
import { createEntityBase } from "../util/CreateEntityBase.js";
import { ContactEntity } from "../contacts/entities/Contact.entity.js";
import { OrganizationRepository } from "./Organization.repo.js";
import { NestExpressApplication } from "@nestjs/platform-express";

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

  static async ensureRootOrganization(
    app: NestExpressApplication,
  ): Promise<void> {
    const orm = app.get(MikroORM);
    const em = orm.em.fork();
    const rootOrganization = await em.findOne(OrganizationEntity, {
      name: "Root Organization",
    });
    if (rootOrganization && rootOrganization.id != ROOT_ORGANIZATION_ID) {
      throw new Error(
        "Root organization has incorrect id: " + String(rootOrganization.id),
      );
    }
    if (rootOrganization != null) {
      return;
    }
    const result = em.create(OrganizationEntity, {
      name: "Root Organization",
      abbreviatedName: "Root",
      description: "All organizations descend from the root organization.",
    });
    await em.flush();

    if (result.id !== ROOT_ORGANIZATION_ID) {
      throw new Error("Invalid root organization id " + String(result.id));
    }
  }
}
