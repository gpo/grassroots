import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/Users.service";
import { UserEntity } from "../grassroots-shared/User.entity";

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<UserEntity | undefined> {
    void pass;
    return await this.usersService.findOne(email);
  }
}
