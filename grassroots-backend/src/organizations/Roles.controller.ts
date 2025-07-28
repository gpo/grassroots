import { Controller, Get } from "@nestjs/common";
import { RolesService } from "./Roles.service";
import { RolesDTO } from "@grassroots/shared";

@Controller("roles")
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll(): RolesDTO {
    return RolesDTO.from({ roles: this.rolesService.findAll() });
  }
}
