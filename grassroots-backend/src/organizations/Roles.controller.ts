import { Controller, Get } from "@nestjs/common";
import { RolesService } from "./Roles.service";
import { RoleDTO } from "../grassroots-shared/Role.dto";

@Controller("roles")
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll(): RoleDTO[] {
    return this.rolesService.findAll();
  }
}
