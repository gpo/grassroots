import { Injectable } from "@nestjs/common";
import { User } from "../grassroots-shared/User.entity.dto";

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    {
      email: "a@a.com",
      password: "foo",
    },
    {
      email: "b@b.com",
      password: "bar",
    },
  ];

  findOne(email: string): Promise<User | null> {
    return new Promise((resolve) => {
      resolve(this.users.find((user) => user.email === email) ?? null);
    });
  }
}
