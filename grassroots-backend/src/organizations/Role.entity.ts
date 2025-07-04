import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { AssertPropsEqual } from "../grassroots-shared/util/AssertPropsEqual";
import { RoleDTO } from "../grassroots-shared/Role.dto";
import { PropsOf } from "../grassroots-shared/util/PropsOf";

@Entity()
export class RoleEntity implements PropsOf<RoleDTO> {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property()
  canViewContacts!: boolean;

  @Property()
  canManageContacts!: boolean;

  @Property()
  canManageUsers!: boolean;
}

export const check: AssertPropsEqual<RoleEntity, RoleDTO> = true;
