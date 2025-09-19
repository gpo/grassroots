import { IsJSON, IsString, ValidateNested } from "class-validator";
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
