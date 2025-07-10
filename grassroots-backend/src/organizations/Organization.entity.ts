import {
  BaseEntity,
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { OrganizationDTO } from "../grassroots-shared/Organization.dto";
import { UserRoleEntity } from "../users/UserRole.entity";

@Entity()
export class OrganizationEntity extends BaseEntity {
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

  @OneToOne(() => UserRoleEntity)
  userRoles;

  toDTO(): OrganizationDTO {
    return {
      id: this.id,
      name: this.name,
      parentId: this.parent?.id,
    };
  }
}
