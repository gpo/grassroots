import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { createDTOBase } from "../../util/CreateDTOBase.js";
import type { CallStatus, TwilioCallStatus } from "./CallStatus.dto.js";
import { CallStatusDecorator } from "./CallStatus.dto.js";
import { Transform, Type } from "class-transformer";
import { ContactDTO, CreateContactRequestDTO } from "../Contact.dto.js";
import { PaginatedRequestDTO, PaginatedResponseDTO } from "../Paginated.dto.js";
import { Trim } from "../../decorators/Trim.decorator.js";

export class PhoneCanvassDTO extends createDTOBase("PhoneCanvass") {
  @IsString()
  id!: string;

  @ValidateNested({ each: true })
  @Type(() => PhoneCanvassContactDTO)
  contacts!: PhoneCanvassContactDTO[];
}

export class CreatePhoneCanvasContactRequestDTO extends createDTOBase(
  "CreatePhoneCanvasContactRequest",
) {
  @ValidateNested()
  @Type(() => CreateContactRequestDTO)
  contact!: CreateContactRequestDTO;
  @IsJSON()
  metadata!: string;
}

export class CreatePhoneCanvassRequestDTO extends createDTOBase(
  "CreatePhoneCanvassRequest",
) {
  @IsString()
  name!: string;

  @ValidateNested({ each: true })
  @Type(() => CreatePhoneCanvasContactRequestDTO)
  contacts!: CreatePhoneCanvasContactRequestDTO[];
}

// This needs to live outside the route or the babel transformer gets confused by the decorator.
// We don't actually touch this in the backend.
export class CreatePhoneCanvassDataValidatedDTO extends createDTOBase(
  "CreatePhoneCanvassDataValidated",
) {
  @IsNotEmpty()
  name!: string;
}

export class CreatePhoneCanvasCSVRequestDTO extends createDTOBase(
  "CreatePhoneCanvasCSVRequest",
) {
  @IsString()
  name!: string;

  @IsString()
  csv!: string;
}

export class CreatePhoneCanvassResponseDTO extends createDTOBase(
  "CreatePhoneCanvassResponse",
) {
  id!: string;
}

export class PhoneCanvassContactDTO extends createDTOBase(
  "PhoneCanvassContact",
) {
  @ValidateNested()
  @Type(() => ContactDTO)
  contact!: ContactDTO;

  @IsJSON()
  metadata!: string;

  getMetadataByKey(key: string): undefined | string | string[] {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const metadata = JSON.parse(this.metadata) as [string, string | string[]][];
    return metadata.find((x) => x[0] == key)?.[1];
  }

  // eslint-disable-next-line @darraghor/nestjs-typed/all-properties-are-whitelisted, @darraghor/nestjs-typed/all-properties-have-explicit-defined
  @CallStatusDecorator()
  callStatus!: CallStatus;
}

export class PhoneCanvassProgressInfoResponseDTO extends createDTOBase(
  "PhoneCanvassProgressInfoResponse",
) {
  @IsNumber()
  count!: number;
}

export class PaginatedPhoneCanvassContactListRequestDTO extends createDTOBase(
  "PaginatedPhoneCanvassContactListRequest",
) {
  @IsString()
  phoneCanvassId!: string;

  @ValidateNested()
  @Type(() => PaginatedRequestDTO)
  paginated!: PaginatedRequestDTO;
}

export class PaginatedPhoneCanvassContactResponseDTO extends createDTOBase(
  "PaginatedPhoneCanvassContactResponse",
) {
  @ValidateNested({ each: true })
  @Type(() => PhoneCanvassContactDTO)
  @IsArray()
  contacts!: PhoneCanvassContactDTO[];

  @ValidateNested()
  @Type(() => PaginatedResponseDTO)
  paginated!: PaginatedResponseDTO;

  static empty(): PaginatedPhoneCanvassContactResponseDTO {
    return PaginatedPhoneCanvassContactResponseDTO.from({
      contacts: [],
      paginated: {
        rowsSkipped: 0,
        rowsTotal: 0,
      },
    });
  }
}

export class PhoneCanvassAuthTokenResponseDTO extends createDTOBase(
  "PhoneCanvassAuthTokenResponse",
) {
  @IsString()
  token!: string;
}

export class PhoneCanvasTwilioVoiceCallbackDTO extends createDTOBase(
  "PhoneCanvasTwilioVoiceCallback",
) {
  // We require this to be present, but don't want to use default error handling with twilio responses, so
  // we mark it optional and manually handle the case where it's missing.
  @IsString()
  @IsOptional()
  conference?: string;
}

export class PhoneCanvasTwilioCallStatusCallbackDTO extends createDTOBase(
  "PhoneCanvasTwilioCallStatusCallback",
) {
  @IsString()
  CallSid!: string;
  @IsString()
  CallStatus!: TwilioCallStatus;

  @IsOptional()
  CallDuration?: number;

  /**
   * Convert RFC 2822 timestamp to a ms since epoch
   */
  @Transform(({ value }: { value: string }) => {
    const time = Date.parse(value);
    return Number.isNaN(time) ? undefined : time;
  })
  @IsDate()
  Timestamp!: number;
}

// (displayName, activePhoneCanvassId) is globally unique.
export class CreatePhoneCanvassCallerDTO extends createDTOBase(
  "CreatePhoneCanvassCaller",
) {
  @Trim()
  @IsNotEmpty()
  displayName!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  activePhoneCanvassId!: string;

  @IsBoolean()
  ready!: boolean;
}

// (displayName, activePhoneCanvassId) is globally unique.
export class PhoneCanvassCallerDTO extends createDTOBase("PhoneCanvassCaller") {
  @IsNumber()
  id!: number;

  @Trim()
  @IsNotEmpty()
  displayName!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  activePhoneCanvassId!: string;

  @IsBoolean()
  ready!: boolean;
}
