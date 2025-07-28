import { Controller, Get } from "@nestjs/common";
import { UsersDTO } from "@grassroots/shared";
import { UsersService } from "../users/Users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<UsersDTO> {
    return UsersDTO.from({
      users: await this.usersService.findAll(),
    });
  }
}
