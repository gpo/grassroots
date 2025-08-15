import {
  Entity,
  ManyToOne,
  OptionalProps,
  PrimaryKey,
  Property,
  Rel,
} from "@mikro-orm/core";
import { UserEntity } from "./User.entity";
import { RoleEntity, ROLES } from "../organizations/Roles.service";
import { OrganizationEntity } from "../organizations/Organization.entity";
import { UserRoleDTO } from "grassroots-shared/UserRole.dto";
import { createEntityBase } from "../util/CreateEntityBase";

@Entity()
export class UserRoleEntity extends createEntityBase<"UserRole", UserRoleDTO>(
  "UserRole",
) {
  // We don't need to be given a role to create a UserRoleEntity, since it's currently
  // just computed from _roleId.
  [OptionalProps]?: "role";

  @PrimaryKey()
  id!: number;

  @ManyToOne(() => UserEntity)
  user!: Rel<UserEntity>;

  @Property()
  _roleId!: number;

  @Property({ persist: false })
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
    return UserRoleDTO.from({
      id: this.id,
      userId: this.user.id,
      role: this.role.toDTO(),
      organizationId: this.organization.id,
      inherited: this.inherited,
    });
  }
}
