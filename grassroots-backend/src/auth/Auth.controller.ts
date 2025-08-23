import {
  Controller,
  Request,
  Get,
  Response,
  Post,
  UseGuards,
  Query,
  BadRequestException,
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
  @Get("login")
  @UseGuards(OAuthGuard)
  @PublicRoute()
  @ApiQuery({ name: "redirect_path", type: String, required: true })
  async login(
    @Query("redirect_path") redirectPath: string | undefined,
  ): Promise<VoidDTO> {
    // Validate that redirect_path is provided
    if (
      redirectPath === undefined ||
      redirectPath === "" ||
      redirectPath.trim() === ""
    ) {
      throw new BadRequestException("redirect_path parameter is required");
    }

    // Validate URL format and domain whitelist to prevent open redirects
    let redirectUrl: URL;
    try {
      redirectUrl = new URL(redirectPath);
    } catch {
      throw new BadRequestException("redirect_path must be a valid URL");
    }

    // Get environment variables to check allowed domains
    const environmentVariables = await getEnvironmentVariables();
    const allowedHost = environmentVariables.FRONTEND_HOST;

    if (allowedHost === undefined || allowedHost.trim() === "") {
      throw new Error("Missing env variable for FRONTEND_HOST");
    }

    // Create allowed origins list (you can extend this as needed)
    const allowedOrigins = [
      allowedHost,
      // Add other allowed domains here if needed, e.g.:
      // 'https://staging.yourapp.com',
      // 'http://localhost:3000', // for development
    ];

    // Check if redirect domain is allowed
    if (!allowedOrigins.includes(redirectUrl.origin)) {
      throw new BadRequestException(
        `redirect_path domain '${redirectUrl.origin}' not allowed. Must be one of: ${allowedOrigins.join(", ")}`,
      );
    }

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

    const user = req.user;

    // The session doesn't contain the redirect path by the time req.login is called,
    // If no redirect_path in session, this means login was called without it (which should now be blocked)
    const redirectPath = req.session.redirect_path;
    if (redirectPath === undefined || redirectPath.trim() === "") {
      throw new BadRequestException(
        "Invalid login flow: missing redirect_path",
      );
    }

    req.session.redirect_path = undefined;

    await new Promise<void>((resolve, reject) => {
      req.login(user, (err: unknown) => {
        if (err !== undefined) {
          reject(
            err instanceof Error
              ? err
              : new Error(
                  typeof err === "string" ? err : "Unknown error occurred",
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
                  typeof err === "string" ? err : "Unknown error occurred",
                ),
          );
          return;
        }
        resolve(VoidDTO.get());
      });
    });
  }
}
