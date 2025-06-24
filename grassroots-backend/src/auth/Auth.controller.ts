import {
  Controller,
  Request,
  Get,
  Response,
  Post,
  UseGuards,
  Query,
} from "@nestjs/common";
import { Response as ExpressResponse } from "express";
import type { GrassrootsRequest } from "../types/GrassrootsRequest";
import { ConfigService } from "@nestjs/config";
import { LoginStateDTO } from "../grassroots-shared/LoginState.dto";
import { VoidDTO } from "../grassroots-shared/Void.dto";
import { ApiProperty, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { PublicRoute } from "./PublicRoute.decorator";
import { OAuthGuard } from "./OAuth.guard";

@Controller("auth")
export class AuthController {
  constructor(private configService: ConfigService) {}

  // The frontend can redirect here to trigger login.
  @Get("login")
  @UseGuards(OAuthGuard)
  @PublicRoute()
  @ApiQuery({ name: "path", type: String })
  login(@Query() path: string): void {
    void path;
  }

  @Get("google/callback")
  @UseGuards(OAuthGuard)
  @PublicRoute()
  @ApiProperty()
  googleAuthRedirect(
    @Request() req: GrassrootsRequest,
    @Response() response: ExpressResponse,
  ): void {
    const host = this.configService.get<string>("FRONTEND_HOST");
    if (host === undefined) {
      throw new Error("Missing env variable for FRONTEND_HOST");
    }
    if (!req.user) {
      throw new Error("No user found for login.");
    }
    req.login(req.user, (err) => {
      if (err !== undefined) {
        throw err;
      }
      response.redirect(host);
    });
  }

  @Get("is_authenticated")
  @PublicRoute()
  isUserLoggedIn(@Request() req: GrassrootsRequest): LoginStateDTO {
    return { isLoggedIn: req.isAuthenticated(), user: req.user };
  }

  // This is an example of using user info, to enable a test.
  // TODO: remove this once we have real routes using user info.
  @Get("example_route_using_user")
  // Not sure why UseGuards breaks the OpenAPI plugin.
  @ApiResponse({ status: 200, type: LoginStateDTO })
  example(@Request() req: GrassrootsRequest): LoginStateDTO {
    return { isLoggedIn: req.isAuthenticated(), user: req.user };
  }

  @Post("logout")
  async logout(@Request() req: GrassrootsRequest): Promise<VoidDTO> {
    return new Promise((resolve, reject) => {
      req.logout((err: Error | undefined) => {
        if (err !== undefined) {
          reject(err);
        } else {
          resolve({});
        }
      });
    });
  }
}
