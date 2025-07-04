import { Injectable } from "@nestjs/common";
import { Permission } from "../grassroots-shared/Permission";

class RoleEntity {
  id!: number;
  name!: string;
  permissions!: Permission[];
}

export type RoleName =
  | "No Permissions"
  | "View Only"
  | "Contact Manager"
  | "Admin";

export const ROLES: RoleEntity[] = [
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

@Injectable()
export class RolesService {
  findAll(): RoleEntity[] {
    return ROLES;
  }
}
