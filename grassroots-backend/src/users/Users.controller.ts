import { Body, Controller, Get, Post, Query } from "@nestjs/common";
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

  @Post("find-or-create")
  async findOrCreate(@Body() user: UserDTO): Promise<UserDTO> {
    console.log("Create user with roles");
    console.log(user.userRoles);
    return await this.usersService.findOrCreate(user);
  }

  @Get("user-permissions-for-org")
  async getUserPermissionsForOrg(
    @Query()
    userPermissionsForOrgRequestDTO: UserPermissionsForOrgRequestDTO,
  ): Promise<PermissionsDTO> {
    return {
      permissions: await this.usersService.getUserPermissionsForOrg(
        userPermissionsForOrgRequestDTO.userId,
        userPermissionsForOrgRequestDTO.organizationId,
      ),
    };
  }
}
