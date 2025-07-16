import { Injectable } from "@nestjs/common";
import { Permission } from "../grassroots-shared/Permission.dto";
import { RoleDTO } from "../grassroots-shared/Role.dto";
import { createEntityBase } from "../util/CreateEntityBase";
import { plainToInstance } from "class-transformer";

class RoleEntity extends createEntityBase<"RoleEntity", RoleDTO>() {
  id!: number;
  name!: string;
  permissions!: Permission[];

  toDTO(): RoleDTO {
    return RoleDTO.from({
      id: this.id,
      name: this.name,
      permissions: this.permissions,
    });
  }
}

export type RoleName =
  | "No Permissions"
  | "View Only"
  | "Contact Manager"
  | "Admin";

export const ROLES: RoleEntity[] = [
  { id: 1, name: "No Permissions", permissions: [] },
  { id: 2, name: "View Only", permissions: ["VIEW_CONTACTS"] },
  {
    id: 3,
    name: "Contact Manager",
    permissions: ["VIEW_CONTACTS", "MANAGE_CONTACTS"],
  },
  {
    id: 4,
    name: "Admin",
    permissions: ["VIEW_CONTACTS", "MANAGE_CONTACTS", "MANAGE_USERS"],
  },
].map((x) => plainToInstance(RoleEntity, x));

@Injectable()
export class RolesService {
  findAll(): RoleDTO[] {
    return ROLES.map((x) => x.toDTO());
  }
}
