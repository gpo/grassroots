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
  CreatePhoneCanvasContactRequestDTO,
  CreatePhoneCanvasCSVRequestDTO,
  CreatePhoneCanvassRequestDTO,
  CreatePhoneCanvassResponseDTO,
  PhoneCanvassProgressInfoResponseDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { PhoneCanvassService } from "./PhoneCanvass.service.js";
import type { GrassrootsRequest } from "../../types/GrassrootsRequest.js";
import Papa from "papaparse";
import { CreateContactRequestDTO } from "grassroots-shared/dtos/Contact.dto";
import { ROOT_ORGANIZATION_ID } from "grassroots-shared/dtos/Organization.dto";

function getEmail(req: GrassrootsRequest): string {
  const email = req.user?.emails[0];
  if (email === undefined) {
    throw new UnauthorizedException(
      "Missing user email in request to create phone canvas.",
    );
  }
  return email;
}

@Controller("phone-canvass")
export class PhoneCanvassController {
  constructor(private readonly phoneCanvassService: PhoneCanvassService) {}

  @Post()
  async create(
    @Body() canvas: CreatePhoneCanvassRequestDTO,
    @Request() req: GrassrootsRequest,
  ): Promise<CreatePhoneCanvassResponseDTO> {
    const email = getEmail(req);
    return await this.phoneCanvassService.create(canvas, email);
  }

  @Post("create-csv")
  async createWithCSV(
    @Body() canvasData: CreatePhoneCanvasCSVRequestDTO,
    @Request() req: GrassrootsRequest,
  ): Promise<CreatePhoneCanvassResponseDTO> {
    const email = getEmail(req);
    const rows = Papa.parse<{
      metadata: string;
      email: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
    }>(canvasData.csv, {
      header: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      transform: (v) => v.trim(),
    });

    const createDTO = CreatePhoneCanvassRequestDTO.from({
      name: canvasData.name,
      contacts: rows.data.map((contactRow) =>
        CreatePhoneCanvasContactRequestDTO.from({
          contact: CreateContactRequestDTO.from({
            email: contactRow.email,
            firstName: contactRow.firstName,
            lastName: contactRow.lastName,
            phoneNumber: contactRow.phoneNumber,
            organizationId: ROOT_ORGANIZATION_ID,
          }),
          metadata: contactRow.metadata,
        }),
      ),
    });

    return await this.phoneCanvassService.create(createDTO, email);
  }

  @Get("progress/:id")
  async getProgressInfo(
    @Param("id") id: string,
  ): Promise<PhoneCanvassProgressInfoResponseDTO> {
    return await this.phoneCanvassService.getProgressInfo(id);
  }
}
