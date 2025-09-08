import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import {
  UserDTO,
  UserPermissionsForOrgRequestDTO,
  UsersDTO,
} from "../grassroots-shared/User.dto.js";
import { UsersService } from "../users/Users.service.js";
import { PermissionsDTO } from "../grassroots-shared/Permission.dto.js";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<UsersDTO> {
    return UsersDTO.from({
      users: await this.usersService.findAll(),
    });
  }

  @Post("find-or-create")
  async findOrCreate(@Body() user: UserDTO): Promise<UserDTO> {
    return await this.usersService.findOrCreate(user);
  }

  @Get("user-permissions-for-org")
  async getUserPermissionsForOrg(
    @Query()
    userPermissionsForOrgRequestDTO: UserPermissionsForOrgRequestDTO,
  ): Promise<PermissionsDTO> {
    return PermissionsDTO.from({
      permissions: await this.usersService.getUserPermissionsForOrg(
        userPermissionsForOrgRequestDTO.userId,
        userPermissionsForOrgRequestDTO.organizationId,
      ),
    });
  }
}
