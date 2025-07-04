import { Controller, Get } from "@nestjs/common";
import { RolesService } from "./Roles.service";
import { RoleResponseDTO } from "../grassroots-shared/Role.dto";

@Controller("roles")
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll(): RoleResponseDTO[] {
    return this.rolesService.findAll();
  }
}
