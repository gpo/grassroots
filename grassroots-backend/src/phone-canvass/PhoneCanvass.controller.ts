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
  Res,
  InternalServerErrorException,
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
import type { Express, Response } from "express";
import type * as expressSession from "express-session";
import { twilioCallStatusToCallStatus } from "grassroots-shared/dtos/PhoneCanvass/CallStatus.dto";
import { VoidDTO } from "grassroots-shared/dtos/Void.dto";
import { VOICEMAIL_STORAGE_DIR } from "./PhoneCanvass.module.js";
import { readdir } from "fs/promises";
import { resolve } from "path";
import VoiceResponse from "twilio/lib/twiml/VoiceResponse.js";
import { getEnvVars } from "../GetEnvVars.js";
import { VALID_TWILIO_AUDIO_MIME_TYPES } from "grassroots-shared/constants/ValidTwilioAudioMimeTypes";
import { concatMap, debounceTime, groupBy, mergeMap, Subject } from "rxjs";

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
  twilioCallStatusCallback$ =
    new Subject<PhoneCanvasTwilioCallStatusCallbackDTO>();
  constructor(private readonly phoneCanvassService: PhoneCanvassService) {
    // We want to process twilio status callbacks serially for each call, but in parallel across calls.
    this.twilioCallStatusCallback$
      .pipe(
        groupBy((x) => x.CallSid, { duration: debounceTime(60_000) }),
        mergeMap((group$) =>
          group$.pipe(
            concatMap(async (callback) => {
              const status = twilioCallStatusToCallStatus(callback.CallStatus);
              console.log("status callback", callback.CallStatus, status);

              await this.phoneCanvassService.updateCall({
                ...status,
                sid: callback.CallSid,
                timestamp: callback.Timestamp,
                playedVoicemail: false,
              });
            }),
          ),
        ),
      )
      .subscribe();
  }

  @Post()
  @UseInterceptors(
    FileInterceptor("voiceMailAudioFile", {
      fileFilter: (req, file, cb) => {
        if (!VALID_TWILIO_AUDIO_MIME_TYPES.includes(file.mimetype)) {
          cb(
            new BadRequestException("Unsupported file format. Try wav or mp3."),
            false,
          );
          return;
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    }),
  )

  // TODO: factor csv processing out of the controller.
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
      "middle_name",
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

        const dto = CreatePhoneCanvasContactRequestDTO.from({
          contact: CreateContactRequestDTO.from({
            gvote_id: contactRow.id,
            email: contactRow.email,
            firstName: contactRow.first_name,
            middleName: contactRow.middle_name,
            lastName: contactRow.last_name,
            phoneNumber: contactRow.phone,
            organizationId: ROOT_ORGANIZATION_ID,
            address: contactRow.address,
            town: contactRow.town,
            postalCode: contactRow.postal_code,
            province: contactRow.province,
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
  twilioCallStatusCallback(
    @Body() body: PhoneCanvasTwilioCallStatusCallbackDTO,
  ): string {
    this.twilioCallStatusCallback$.next(body);
    return `<Response></Response>`;
  }

  // TODO: move this logic closer to the twilioService.
  // We don't handle this in serial with status updates, since we need to return something
  // different depending on status.
  // If 2 seconds have passed, we've already dialed someone in.
  // If not, we need to dial them in.
  // If this is a machine, we need to play the message.
  // This means we only need to know if there's already a caller.
  // Otherwise, we just need to look at who answered.
  // There is risk of a race where we decided to dial someone in twice though.
  // eslint-disable-next-line grassroots/controller-routes-return-dtos
  @Post("webhooks/twilio-call-answered")
  @PublicRoute()
  @Header("Content-Type", "text/xml")
  async twilioCallAnsweredCallback(
    @Body() body: PhoneCanvasTwilioCallAnsweredCallbackDTO,
  ): Promise<string> {
    return await this.phoneCanvassService.twilioCallAnsweredCallback(body);
  }

  // TODO: move this logic closer to the twilioService.
  // This isn't technically a webhook, but it does get hit by twilio servers, so
  // we treat it the same.
  // eslint-disable-next-line grassroots/controller-routes-return-dtos
  @Get("webhooks/get-voicemail/:id")
  @PublicRoute()
  async getVoicemail(
    @Param("id") id: string,
    @Res() res: Response,
  ): Promise<void> {
    console.log("GET VOICEMAIL");
    let voicemails = await readdir(VOICEMAIL_STORAGE_DIR);
    const regex = new RegExp(`${id}\\.*`);
    voicemails = voicemails.filter((x) => regex.test(x));

    if (voicemails.length > 1) {
      throw new InternalServerErrorException(
        "Multiple voicemails with that id",
      );
    }

    const voicemail = voicemails[0];
    if (voicemail === undefined) {
      throw new NotFoundException("No voicemail with that id");
    }

    res.sendFile(resolve(VOICEMAIL_STORAGE_DIR + "/" + voicemail));
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
