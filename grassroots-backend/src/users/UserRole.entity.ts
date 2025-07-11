import { Entity, ManyToOne, PrimaryKey, Property, Rel } from "@mikro-orm/core";
import { UserEntity } from "./User.entity";
import { RoleEntity, ROLES } from "../organizations/Roles.service";
import { OrganizationEntity } from "../organizations/Organization.entity";
import { UserRoleDTO } from "../grassroots-shared/UserRole.dto";

@Entity()
export class UserRoleEntity {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => UserEntity)
  user!: Rel<UserEntity>;

  @Property()
  _roleId!: number;

  get role(): RoleEntity {
    const r = ROLES.get(this._roleId);
    if (r === undefined) {
      throw new Error("Invalid role id");
    }
    return r;
  }

  @ManyToOne(() => OrganizationEntity)
  organization!: OrganizationEntity;

  @Property()
  inherited!: boolean;

  toDTO(): UserRoleDTO {
    return {
      id: this.id,
      userId: this.user.id,
      role: this.role.toDTO(),
      organizationId: this.organization.id,
      inherited: this.inherited,
    };
  }
}
