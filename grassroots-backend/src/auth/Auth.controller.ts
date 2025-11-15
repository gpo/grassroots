import {
  Controller,
  Request,
  Get,
  Response,
  Post,
  UseGuards,
  Query,
  Body,
  Session,
  NotFoundException,
} from "@nestjs/common";
import type { Response as ExpressResponse } from "express";
import type { GrassrootsRequest } from "../../types/GrassrootsRequest.js";
import { LoginStateDTO } from "grassroots-shared/dtos/LoginState.dto";
import { VoidDTO } from "grassroots-shared/dtos/Void.dto";
import { ApiProperty, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { PublicRoute } from "./PublicRoute.decorator.js";
import { OAuthGuard } from "./OAuth.guard.js";
import type { SessionData } from "express-session";
import {
  OrganizationDTO,
  OrganizationReferenceDTO,
} from "grassroots-shared/dtos/Organization.dto";
import { OrganizationsService } from "../organizations/Organizations.service.js";
import { getEnvVars } from "../GetEnvVars.js";

@Controller("auth")
export class AuthController {
  constructor(private readonly organizationService: OrganizationsService) {}

  // The frontend can redirect here to trigger login.
  @Get("login")
  @UseGuards(OAuthGuard)
  @PublicRoute()
  @ApiQuery({ name: "redirect_path", type: String })
  login(@Query() redirect_path: string): VoidDTO {
    // The redirect path is used by the OAuth guard.
    void redirect_path;
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
    console.log("CALLBACK");
    if (!req.user) {
      throw new Error("No user found for login.");
    }
    // The session doesn't contain the redirect path by the time req.login is called,
    // so make sure to stash it here.
    const redirectPath =
      req.session.redirect_path ?? (await getEnvVars()).VITE_FRONTEND_HOST;
    // To prevent a redirect path accidentally being used multiple times, clear this
    // as soon as it's read.
    req.session.redirect_path = undefined;

    console.log("LOGIN");
    req.login(req.user, (err) => {
      console.log("LOGIN FUNC");
      if (err !== undefined) {
        response.redirect("/");
      }
      response.redirect(redirectPath);
    });
    return VoidDTO.get();
  }

  @Get("is_authenticated")
  @PublicRoute()
  isUserLoggedIn(@Request() req: GrassrootsRequest): LoginStateDTO {
    return LoginStateDTO.from({ user: req.user });
  }

  // This is an example of using user info, to enable a test.
  // TODO: remove this once we have real routes using user info.
  @Get("example_route_using_user")
  // Not sure why UseGuards breaks the OpenAPI plugin.
  @ApiResponse({ status: 200, type: LoginStateDTO })
  example(@Request() req: GrassrootsRequest): LoginStateDTO {
    return LoginStateDTO.from({ user: req.user });
  }

  @Post("logout")
  async logout(@Request() req: GrassrootsRequest): Promise<VoidDTO> {
    return new Promise((resolve, reject) => {
      req.logout((err: Error | undefined) => {
        if (err !== undefined) {
          reject(err);
        } else {
          resolve(VoidDTO.from({}));
        }
      });
    });
  }

  @Post("set-active-org")
  setActiveOrg(
    @Body() organizationReference: OrganizationReferenceDTO,
    @Session() session: SessionData,
  ): VoidDTO {
    session.activeOrganizationId = organizationReference.id;
    return VoidDTO.from({});
  }

  @Get("active-org")
  async getActiveOrg(
    @Session() session: SessionData,
  ): Promise<OrganizationDTO> {
    if (session.activeOrganizationId == undefined) {
      throw new NotFoundException("No active organization.");
    }
    return this.organizationService.findOneById(session.activeOrganizationId);
  }
}
