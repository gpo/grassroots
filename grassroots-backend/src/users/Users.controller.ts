import { Controller, Get } from "@nestjs/common";
import { UserDTO } from "../grassroots-shared/User.dto";
import { UsersService } from "../users/Users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<UserDTO[]> {
    return this.usersService.findAll();
  }
}
