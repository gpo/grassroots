import {
  Controller,
  Post,
  Body,
  Request,
  UnauthorizedException,
  Get,
  Param,
  Header,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import {
  CreatePhoneCanvasContactRequestDTO,
  CreatePhoneCanvasCSVRequestDTO,
  CreatePhoneCanvassRequestDTO,
  CreatePhoneCanvassResponseDTO,
  PhoneCanvassAuthTokenResponseDTO,
  PaginatedPhoneCanvassContactListRequestDTO,
  PaginatedPhoneCanvassContactResponseDTO,
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
import { validateSync, ValidationError } from "class-validator";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Express } from "express";

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
  @UseInterceptors(
    FileInterceptor("voiceMailAudioFile", {
      fileFilter: (req, file, cb) => {
        console.log("Incoming file field:", file.fieldname);
        if (!file.mimetype.startsWith("audio/")) {
          cb(new BadRequestException("Only audio files are allowed!"), false);
          return;
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    }),
  )
  async create(
    @Body() body: CreatePhoneCanvassMultipartBody,
    @UploadedFile() voiceMailAudioFile: Express.Multer.File,
    @Request() req: GrassrootsRequest,
  ): Promise<CreatePhoneCanvassResponseDTO> {
    const email = getEmail(req);
    
    const canvasData = CreatePhoneCanvasCSVRequestDTO.from({
      name: body.name,
      csv: body.csv,
    });

    const HANDLED_FIELDS = new Set([
      "id",
      "gvote_id",
      "email",
      "first_name",
      "last_name",
      "phone",
    ]);
    const rows = Papa.parse<
      {
        id: string;
        gvote_id: string;
        email: string;
        first_name: string;
        middle_name: string;
        last_name: string;
        phone: string;
      } & Record<string, string>
    >(canvasData.csv, {
      header: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      transform: (v) => v.trim(),
    });

    if (rows.errors.length > 0) {
      throw new BadRequestException(
        "CSV structure invalid: " + rows.errors.map((x) => x.message).join(" "),
      );
    }
    const allFields = rows.meta.fields;
    const unhandledFields = allFields?.filter((x) => !HANDLED_FIELDS.has(x));

    const validationErrors: ValidationError[][] = [];
    const createDTO = CreatePhoneCanvassRequestDTO.from({
      name: canvasData.name,
      contacts: rows.data.map((contactRow) => {
        const metadata = unhandledFields?.map((field) => {
          if (field !== "tags") {
            return [field, contactRow[field]];
          }
          const tagsString = contactRow[field];
          const tags = tagsString
            ?.split(";")
            .map((x) => x.trim())
            .filter((x) => x.length > 0);
          return [field, tags];
        });

        const dto = CreatePhoneCanvasContactRequestDTO.from({
          contact: CreateContactRequestDTO.from({
            gvote_id: contactRow.id,
            email: contactRow.email,
            firstName: contactRow.first_name,
            middleName: contactRow.middle_name,
            lastName: contactRow.last_name,
            phoneNumber: contactRow.phone,
            organizationId: ROOT_ORGANIZATION_ID,
          }),
          metadata: JSON.stringify(metadata),
        });

        const errors = validateSync(dto);
        if (errors.length > 0) {
          validationErrors.push();
        }
        return dto;
      }),
    });

    if (validationErrors.length > 0) {
      throw new BadRequestException(
        "CSV values invalid: " +
          JSON.stringify(
            validationErrors.flat().map((x) => JSON.stringify(x.property)),
          ),
      );
    }

    return await this.phoneCanvassService.create(
      createDTO,
      email,
      voiceMailAudioFile,
    );
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

  @Post("list")
  async list(
    @Body()
    request: PaginatedPhoneCanvassContactListRequestDTO,
  ): Promise<PaginatedPhoneCanvassContactResponseDTO> {
    return await this.phoneCanvassService.list(request);
  }
}

interface CreatePhoneCanvassMultipartBody {
  name: string;
  csv: string;
}
