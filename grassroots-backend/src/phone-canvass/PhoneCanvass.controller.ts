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
  Session,
  NotFoundException,
} from "@nestjs/common";
import {
  CreatePhoneCanvasContactRequestDTO,
  CreatePhoneCanvasCSVRequestDTO,
  CreatePhoneCanvassRequestDTO,
  CreatePhoneCanvassResponseDTO,
  PaginatedPhoneCanvassContactListRequestDTO,
  PaginatedPhoneCanvassContactResponseDTO,
  PhoneCanvassCallerDTO,
  CreatePhoneCanvassCallerDTO,
  PhoneCanvasTwilioCallStatusCallbackDTO,
  PhoneCanvasTwilioCallAnsweredCallbackDTO,
  PhoneCanvassDetailsDTO,
  PhoneCanvassContactDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { PhoneCanvassService } from "./PhoneCanvass.service.js";
import type { GrassrootsRequest } from "../../types/GrassrootsRequest.js";
import { PublicRoute } from "../../src/auth/PublicRoute.decorator.js";
import Papa from "papaparse";
import { CreateContactRequestDTO } from "grassroots-shared/dtos/Contact.dto";
import { ROOT_ORGANIZATION_ID } from "grassroots-shared/dtos/Organization.dto";
import { validateSync, ValidationError } from "class-validator";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Express } from "express";
import type * as expressSession from "express-session";
import { twilioCallStatusToCallStatus } from "grassroots-shared/dtos/PhoneCanvass/CallStatus.dto";
import { VoidDTO } from "grassroots-shared/dtos/Void.dto";

export interface GVoteCSVEntry {
  id: string;
  email: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  phone: string;
  tags: string;
  address: string;
  town: string;
  postal_code: string;
  province: string;
  support_level: number;
  party_support: string;
  voted: string;
}

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
        if (!file.mimetype.startsWith("audio/")) {
          cb(new BadRequestException("Only audio files are allowed!"), false);
          return;
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    }),
  )

  // TODO: factor this out of the controller.
  async create(
    @Body() body: CreatePhoneCanvasCSVRequestDTO,
    @UploadedFile() voiceMailAudioFile: Express.Multer.File,
    @Request() req: GrassrootsRequest,
  ): Promise<CreatePhoneCanvassResponseDTO> {
    const email = getEmail(req);

    const HANDLED_FIELDS = new Set([
      "id",
      "email",
      "first_name",
      "last_name",
      "phone",
      "address",
      "town",
      "postal_code",
      "province",
      "support_level",
      "party_support",
      "voted",
      "membership_status",
    ]);
    const rows = Papa.parse<GVoteCSVEntry & Record<string, string>>(body.csv, {
      header: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      delimiter: ",",
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
      name: body.name,
      contacts: rows.data.map((contactRow) => {
        const metadata = unhandledFields?.map((field) => {
          if (field !== "tags") {
            return [field, contactRow[field]];
          }
          const tagsString = contactRow[field];
          const tags = tagsString
            .split(";")
            .map((x) => x.trim())
            .filter((x) => x.length > 0);
          return [field, tags];
        });

        const address =
          contactRow.address +
          `, ${contactRow.town} ${contactRow.province} ${contactRow.postal_code}`;

        const dto = CreatePhoneCanvasContactRequestDTO.from({
          contact: CreateContactRequestDTO.from({
            gvote_id: contactRow.id,
            email: contactRow.email,
            firstName: contactRow.first_name,
            middleName: contactRow.middle_name,
            lastName: contactRow.last_name,
            phoneNumber: contactRow.phone,
            organizationId: ROOT_ORGANIZATION_ID,
            address,
            supportLevel: contactRow.support_level,
            partySupport: contactRow.party_support,
            voted: contactRow.voted,
            membershipStatus: contactRow.membership_status,
          }),
          metadata: JSON.stringify(metadata),
          notes: "",
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

  // eslint-disable-next-line grassroots/controller-routes-return-dtos
  @Post("webhooks/twilio-callstatus")
  @PublicRoute()
  @Header("Content-Type", "text/xml")
  async twilioCallStatusCallback(
    @Body() body: PhoneCanvasTwilioCallStatusCallbackDTO,
  ): Promise<string> {
    const status = twilioCallStatusToCallStatus(body.CallStatus);
    await this.phoneCanvassService.updateCall({
      ...status,
      sid: body.CallSid,
      timestamp: body.Timestamp,
    });
    return `<Response></Response>`;
  }

  // TODO: move this logic closer to the twilioService.
  // eslint-disable-next-line grassroots/controller-routes-return-dtos
  @Post("webhooks/twilio-call-answered")
  @PublicRoute()
  @Header("Content-Type", "text/xml")
  twilioCallAnsweredCallback(
    @Body() body: PhoneCanvasTwilioCallAnsweredCallbackDTO,
  ): string {
    const call = this.phoneCanvassService.callsBySid.get(body.CallSid);
    if (!call) {
      throw new NotFoundException(`Can't find call with id ${body.CallSid}`);
    }
    if (body.AnsweredBy === "human" || body.AnsweredBy === "unknown") {
      return `<Response>
      <Dial>
        <Conference>
          ${String(call.contactId())}
        </Conference>
      </Dial>
    </Response>`;
    }
    throw new Error("Not handling voicemails yet.");
  }

  @Get("details/:id")
  @PublicRoute()
  async getPhoneCanvassDetails(
    @Param("id") id: string,
  ): Promise<PhoneCanvassDetailsDTO> {
    return await this.phoneCanvassService.getDetails(id);
  }

  @Post("list")
  async list(
    @Body()
    request: PaginatedPhoneCanvassContactListRequestDTO,
  ): Promise<PaginatedPhoneCanvassContactResponseDTO> {
    return await this.phoneCanvassService.list(request);
  }

  @Get("contact/:id")
  async getContact(@Param("id") id: number): Promise<PhoneCanvassContactDTO> {
    return await this.phoneCanvassService.getContact(id);
  }

  @Post("register-caller")
  async registerCaller(
    @Body() caller: CreatePhoneCanvassCallerDTO,
    @Session() session: expressSession.SessionData,
  ): Promise<PhoneCanvassCallerDTO> {
    const newCaller = await this.phoneCanvassService.registerCaller(caller);
    session.phoneCanvassCaller = newCaller;
    return newCaller;
  }

  @Post("refresh-caller")
  async refreshCaller(
    @Body() caller: PhoneCanvassCallerDTO,
    @Session() session: expressSession.SessionData,
  ): Promise<PhoneCanvassCallerDTO> {
    caller = await this.phoneCanvassService.refreshOrCreateCaller(caller);
    session.phoneCanvassCaller = caller;
    return caller;
  }

  @Post("update-caller")
  async updateCaller(
    @Body() caller: PhoneCanvassCallerDTO,
    @Session() session: expressSession.SessionData,
  ): Promise<PhoneCanvassCallerDTO> {
    caller = await this.phoneCanvassService.updateOrCreateCaller(caller);
    session.phoneCanvassCaller = caller;
    return caller;
  }

  @Get("start-simulation/:id")
  async startSimulation(@Param("id") id: string): Promise<VoidDTO> {
    await this.phoneCanvassService.startSimulating(id);
    return VoidDTO.from({});
  }
}
