import { Injectable } from "@nestjs/common";
import { Permission } from "../grassroots-shared/Permission";
import { RoleDTO } from "../grassroots-shared/Role.dto";
import { plainToInstance } from "class-transformer";

export class RoleEntity {
  id!: number;
  name!: string;
  permissions!: Permission[];

  toDTO(): RoleDTO {
    return {
      id: this.id,
      name: this.name,
      permissions: { permissions: this.permissions },
    };
  }
}

export type RoleName =
  | "No Permissions"
  | "View Only"
  | "Contact Manager"
  | "Admin";

const ROLES_ARRAY: RoleEntity[] = [
  { id: 1, name: "No Permissions", permissions: [] },
  { id: 2, name: "View Only", permissions: [Permission.VIEW_CONTACTS] },
  {
    id: 3,
    name: "Contact Manager",
    permissions: [Permission.VIEW_CONTACTS, Permission.MANAGE_CONTACTS],
  },
  {
    id: 4,
    name: "Admin",
    permissions: [
      Permission.VIEW_CONTACTS,
      Permission.MANAGE_CONTACTS,
      Permission.MANAGE_USERS,
    ],
  },
].map((x) => plainToInstance(RoleEntity, x));

export const ROLES = new Map(ROLES_ARRAY.map((x: RoleEntity) => [x.id, x]));

// This is only required while we keep roles out of the database.
export const ROLES_BY_NAME = new Map<RoleName, RoleEntity>(
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  ROLES_ARRAY.map((x: RoleEntity) => [x.name as RoleName, x]),
);

@Injectable()
export class RolesService {
  findAll(): RoleDTO[] {
    return ROLES_ARRAY.map((role) => role.toDTO());
  }
}
