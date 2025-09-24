import {
  Controller,
  Post,
  Body,
  Request,
  UnauthorizedException,
  Get,
  Param,
} from "@nestjs/common";
import {
  CreatePhoneCanvassRequestDTO,
  CreatePhoneCanvassResponseDTO,
  PhoneCanvassProgressInfoResponseDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { PhoneCanvassService } from "./PhoneCanvass.service.js";
import type { GrassrootsRequest } from "../../types/GrassrootsRequest.js";

@Controller("phone-canvass")
export class PhoneCanvassController {
  constructor(private readonly phoneCanvassService: PhoneCanvassService) {}

  @Post()
  async create(
    @Body() canvas: CreatePhoneCanvassRequestDTO,
    @Request() req: GrassrootsRequest,
  ): Promise<CreatePhoneCanvassResponseDTO> {
    const email = req.user?.emails[0];
    if (email === undefined) {
      throw new UnauthorizedException(
        "Missing user email in request to create phone canvas.",
      );
    }
    return await this.phoneCanvassService.create(canvas, email);
  }

  @Get("progress/:id")
  async getProgressInfo(
    @Param("id") id: string,
  ): Promise<PhoneCanvassProgressInfoResponseDTO> {
    return await this.phoneCanvassService.getProgressInfo(id);
  }
}
