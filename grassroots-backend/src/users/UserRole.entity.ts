import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { UserEntity } from "./User.entity";
import { RoleEntity, ROLES } from "../organizations/Roles.service";
import { OrganizationEntity } from "../organizations/Organization.entity";

@Entity()
export class UserRoleEntity {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => UserEntity)
  user!: UserEntity;

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
}
