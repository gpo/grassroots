import { Controller, Get } from "@nestjs/common";
import { RolesService } from "./Roles.service.js";
import { RolesDTO } from "../grassroots-shared/Role.dto.js";

@Controller("roles")
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll(): RolesDTO {
    return RolesDTO.from({ roles: this.rolesService.findAll() });
  }
}
