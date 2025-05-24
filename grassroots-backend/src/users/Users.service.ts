import { Injectable } from "@nestjs/common";
import { UserEntity } from "../grassroots-shared/User.entity";
import { plainToClass } from "class-transformer";

@Injectable()
export class UsersService {
  findByEmail(email: string): Promise<UserEntity | undefined> {
    // TODO: This is just a stub for now, until we implement OAuth.
    return new Promise((resolve) => {
      resolve(
        plainToClass(UserEntity, {
          email,
        }),
      );
    });
  }
}
