import {
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { OrganizationDTO } from "../grassroots-shared/Organization.dto";
import { createEntityBase } from "../util/CreateEntityBase";
import { OrganizationRepository } from "./Organization.repo";
import { UserRoleEntity } from "../users/UserRole.entity";

@Entity({ repository: () => OrganizationRepository })
export class OrganizationEntity extends createEntityBase<
  "Organization",
  OrganizationDTO
>("Organization") {
  [EntityRepositoryType]?: OrganizationRepository;

  @PrimaryKey({ autoincrement: true })
  id!: number;

  @Property()
  name!: string;

  @ManyToOne(() => OrganizationEntity, {
    nullable: true,
  })
  parent?: OrganizationEntity;

  @OneToMany(() => OrganizationEntity, (organization) => organization.parent)
  children = new Collection<OrganizationEntity>(this);

  @OneToMany(() => UserRoleEntity, (userRole) => userRole.organization)
  userRoles = new Collection<UserRoleEntity>(this);

  toDTO(): OrganizationDTO {
    return OrganizationDTO.from({
      id: this.id,
      name: this.name,
      parentId: this.parent?.id,
    });
  }
}
