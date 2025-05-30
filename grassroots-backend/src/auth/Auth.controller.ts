import { Controller, Post, UseGuards, Request } from "@nestjs/common";
import { ApiBody } from "@nestjs/swagger";
import { AppService } from "../App.service";
import { UserEntity } from "../grassroots-shared/User.entity";
import { GrassrootsRequest } from "../types/GrassrootsRequest";
import { AuthService } from "./Auth.service";
import { DefaultAuthGuard } from "./DefaultAuth.guard";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService,
  ) {}
  @UseGuards(DefaultAuthGuard)
  @ApiBody({ type: UserEntity })
  @Post("auth/login")
  async login(
    @Request() req: GrassrootsRequest,
  ): Promise<UserEntity | undefined> {
    return new Promise((resolve) => {
      if (!req.user) {
        throw new Error("No user found for login.");
      }
      req.login(req.user, (err) => {
        if (err) {
          throw err;
        }
        resolve(req.user);
      });
    });
  }
}
