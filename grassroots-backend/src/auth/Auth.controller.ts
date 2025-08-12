import {
  Controller,
  Request,
  Get,
  Response,
  Post,
  UseGuards,
  Query,
} from "@nestjs/common";
import { ApiQuery, ApiProperty } from "@nestjs/swagger";
import { Response as ExpressResponse } from "express";
import type { GrassrootsRequest } from "../types/GrassrootsRequest";
import { LoginStateDTO } from "../grassroots-shared/LoginState.dto";
import { VoidDTO } from "../grassroots-shared/Void.dto";
import { PublicRoute } from "./PublicRoute.decorator";
import { OAuthGuard } from "./OAuth.guard";
import { getEnvironmentVariables } from "../GetEnvironmentVariables";

@Controller("auth")
export class AuthController {
  // The frontend can redirect here to trigger login.
  @Get("login")
  @UseGuards(OAuthGuard)
  @PublicRoute()
  @ApiQuery({ name: "redirect_path", type: String, required: false })
  login(@Query("redirect_path") redirectPath: string): VoidDTO {
    // The redirect path is used by the OAuth guard.
    void redirectPath;
    return VoidDTO.get();
  }

  @Get("google/callback")
  @UseGuards(OAuthGuard)
  @PublicRoute()
  @ApiProperty()
  async googleAuthRedirect(
    @Request() req: GrassrootsRequest,
    @Response() response: ExpressResponse,
  ): Promise<VoidDTO> {
    const environmentVariables = await getEnvironmentVariables();

    const host = environmentVariables.FRONTEND_HOST;
    if (host === undefined) {
      throw new Error("Missing env variable for FRONTEND_HOST");
    }

    // Check if user exists before using it
    if (req.user === undefined) {
      throw new Error("No user found for login.");
    }

    // The session doesn't contain the redirect path by the time req.login is called,
    const redirectPath = req.session.redirect_path ?? host;
    // To prevent a redirect path accidentally being used multiple times, clear this
    // as soon as it's read.
    req.session.redirect_path = undefined;

    await new Promise<void>((resolve, reject) => {
      // req.user is guaranteed to be defined here due to the check above
      req.login(req.user, (err: unknown) => {
        if (err !== undefined) {
          reject(
            err instanceof Error
              ? err
              : new Error(
                  err === null
                    ? "null"
                    : typeof err === "object"
                      ? JSON.stringify(err)
                      : String(err),
                ),
          );
          return;
        }
        resolve();
      });
    });

    response.redirect(redirectPath);
    return VoidDTO.get();
  }

  @Get("is_authenticated")
  @PublicRoute()
  isUserLoggedIn(@Request() req: GrassrootsRequest): LoginStateDTO {
    return LoginStateDTO.from({ user: req.user ?? undefined });
  }

  @Post("logout")
  async logout(@Request() req: GrassrootsRequest): Promise<VoidDTO> {
    return new Promise((resolve, reject) => {
      req.logout((err: unknown) => {
        if (err !== undefined) {
          reject(
            err instanceof Error
              ? err
              : new Error(
                  err === null
                    ? "null"
                    : typeof err === "object"
                      ? JSON.stringify(err)
                      : String(err),
                ),
          );
          return;
        }
        resolve(VoidDTO.get());
      });
    });
  }
}
