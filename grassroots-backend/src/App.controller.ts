import { Controller, Get, Post, UseGuards, Request } from "@nestjs/common";
import { AppService } from "./App.service";
import { HelloOutDTO } from "./app/entities/Hello.dto";
import { UserEntity } from "./grassroots-shared/User.entity";
import { DefaultAuthGuard } from "./auth/DefaultAuth.guard";
import type { GrassrootsRequest } from "./types/GrassrootsRequest";
import { ApiBody } from "@nestjs/swagger";
import { AuthService } from "./auth/Auth.service";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService,
  ) {}

  @Get()
  getHello(): HelloOutDTO {
    return this.appService.getHello();
  }

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
