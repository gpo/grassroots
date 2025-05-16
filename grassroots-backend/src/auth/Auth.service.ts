import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/Users.service";
import { User } from "../grassroots-shared/User.entity.dto";

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(username: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      void password;
      return result;
    }
    return null;
  }
}
