import { Injectable } from "@nestjs/common";
import { Permission } from "grassroots-shared/Permission.dto";
import { RoleDTO } from "grassroots-shared/Role.dto";
import { createEntityBase } from "../util/CreateEntityBase";
import { plainToInstance } from "class-transformer";

export class RoleEntity extends createEntityBase<"Role", RoleDTO>("Role") {
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

const ROLES_ARRAY: RoleEntity[] = [
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

export const ROLES = new Map(ROLES_ARRAY.map((x: RoleEntity) => [x.id, x]));

// This is only required while we keep roles out of the database.
export const ROLES_BY_NAME = new Map<RoleName, RoleEntity>(
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  ROLES_ARRAY.map((x: RoleEntity) => [x.name as RoleName, x]),
);

@Injectable()
export class RolesService {
  findAll(): RoleDTO[] {
    return ROLES_ARRAY.map((x) => x.toDTO());
  }
}
