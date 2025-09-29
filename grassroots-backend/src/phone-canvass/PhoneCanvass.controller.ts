import {
  Controller,
  Post,
  Body,
  Request,
  UnauthorizedException,
  Get,
  Param,
  Header,
} from "@nestjs/common";
import {
  CreatePhoneCanvasContactRequestDTO,
  CreatePhoneCanvasCSVRequestDTO,
  CreatePhoneCanvassRequestDTO,
  CreatePhoneCanvassResponseDTO,
  PhoneCanvassAuthTokenResponseDTO,
  PhoneCanvassProgressInfoResponseDTO,
  PhoneCanvasTwilioVoiceCallbackDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { PhoneCanvassService } from "./PhoneCanvass.service.js";
import type { GrassrootsRequest } from "../../types/GrassrootsRequest.js";
import { PublicRoute } from "../../src/auth/PublicRoute.decorator.js";
import { VoidDTO } from "grassroots-shared/dtos/Void.dto";
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

    // TODO: validate data.
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

  @Get("auth-token/:id")
  @PublicRoute()
  async getAuthToken(
    @Param("id") id: string,
  ): Promise<PhoneCanvassAuthTokenResponseDTO> {
    return this.phoneCanvassService.getAuthToken(id);
  }

  // This needs to return xml. Note that we aren't using this in dev,
  // as it needs to be a public url on the web. Instead we're using a
  // GCP cloud function.
  // eslint-disable-next-line grassroots/controller-routes-return-dtos
  @Post("twilio-voice")
  @PublicRoute()
  @Header("Content-Type", "text/xml")
  twilioVoiceCallback(@Body() body: PhoneCanvasTwilioVoiceCallbackDTO): string {
    const conferenceName = body.conference;

    if (conferenceName === undefined) {
      return `
        <Response>
          <Say voice="alice">Sorry, no conference was specified. Goodbye.</Say>
          <Hangup/>
        </Response>`;
    }
    return `
      <Response>
        <Dial>
          <Conference>${conferenceName}</Conference>
        </Dial>
      </Response>
    `;
  }

  @Post("start-canvass/:id")
  @PublicRoute()
  async startCanvass(@Param("id") id: string): Promise<VoidDTO> {
    return this.phoneCanvassService.startCanvass(id);
  }

  @Get("progress/:id")
  async getProgressInfo(
    @Param("id") id: string,
  ): Promise<PhoneCanvassProgressInfoResponseDTO> {
    return await this.phoneCanvassService.getProgressInfo(id);
  }
}
