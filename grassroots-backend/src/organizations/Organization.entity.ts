import {
  BaseEntity,
  Collection,
  Entity,
  EntityRepositoryType,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { OrganizationDTO } from "../grassroots-shared/Organization.dto";
import { UserRoleEntity } from "../users/UserRole.entity";
import { OrganizationRepository } from "./Organization.repo";

@Entity({ repository: () => OrganizationRepository })
export class OrganizationEntity extends BaseEntity {
  private __brand!: "OrganizationEntity";
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
    return OrganizationDTO.createWithoutValidation({
      id: this.id,
      name: this.name,
      parentId: this.parent?.id,
    });
  }
}
