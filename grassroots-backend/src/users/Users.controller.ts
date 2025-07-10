import { Body, Controller, Get } from "@nestjs/common";
import {
  PermissionsDTO,
  UserDTO,
  UserPermissionsForOrgRequestDTO,
} from "../grassroots-shared/User.dto";
import { UsersService } from "../users/Users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<UserDTO[]> {
    return this.usersService.findAll();
  }

  @Get("user-permissions-for-org")
  async getUserPermissionsForOrg(
    @Body() userPermissionsForOrgRequestDTO: UserPermissionsForOrgRequestDTO,
  ): Promise<PermissionsDTO> {
    return {
      permissions: await this.usersService.getUserPermissionsForOrg(
        userPermissionsForOrgRequestDTO.userId,
        userPermissionsForOrgRequestDTO.organizationId,
      ),
    };
  }
}
