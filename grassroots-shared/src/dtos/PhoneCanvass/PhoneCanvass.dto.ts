import {
  IsJSON,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { createDTOBase } from "../../util/CreateDTOBase.js";
import { CallStatus, CallStatusDecorator } from "./CallStatus.dto.js";
import { Type } from "class-transformer";
import { ContactDTO, CreateContactRequestDTO } from "../Contact.dto.js";

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
  @ValidateNested({ each: true })
  @Type(() => CreatePhoneCanvasContactRequestDTO)
  contacts!: CreatePhoneCanvasContactRequestDTO[];
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

  // eslint-disable-next-line @darraghor/nestjs-typed/all-properties-are-whitelisted, @darraghor/nestjs-typed/all-properties-have-explicit-defined
  @CallStatusDecorator()
  callStatus!: CallStatus;
}

// We don't ever actually use this class, but the entity needs a DTO to references.
export class PhoneCanvassToContactDTO extends createDTOBase(
  "PhoneCanvassToContact",
) {}

export class PhoneCanvassProgressInfoResponseDTO extends createDTOBase(
  "PhoneCanvassProgressInfoResponse",
) {
  @IsNumber()
  count!: number;
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
  @IsString()
  // We require this to be present, but don't want to use default error handling with twilio responses, so
  // we mark it optional and manually handle the case where it's missing.
  @IsOptional()
  conference?: string;
}
