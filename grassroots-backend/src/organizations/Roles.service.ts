import { Injectable } from "@nestjs/common";
import { Permission } from "../grassroots-shared/Permission";
import { RoleDTO } from "../grassroots-shared/Role.dto";

export class RoleEntity {
  id!: number;
  name!: string;
  permissions!: Permission[];
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
];

export const ROLES = new Map(ROLES_ARRAY.map((x: RoleEntity) => [x.id, x]));

@Injectable()
export class RolesService {
  findAll(): RoleDTO[] {
    return ROLES_ARRAY;
  }
}
