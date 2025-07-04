import "reflect-metadata";
import { Permission } from "./Permission";

export class RoleResponseDTO {
  id!: number;
  name!: string;
  permissions!: Permission[];
}
