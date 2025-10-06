import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  Min,
  ValidateNested,
} from "class-validator";
import { PaginatedRequestDTO, PaginatedResponseDTO } from "./Paginated.dto.js";
import { createDTOBase } from "../util/CreateDTOBase.js";
import { OrganizationDTO } from "./Organization.dto.js";

export class ContactDTO extends createDTOBase("Contact") {
  @IsInt()
  @Min(1)
  id!: number;

  @IsString()
  @Length(24, 32)
  @IsOptional()
  gvote_id?: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsOptional()
  middleName?: string;

  @IsNotEmpty()
  lastName!: string;

  formatName(): string {
    if (this.middleName !== undefined) {
      return `${this.firstName} ${this.middleName} ${this.lastName}`;
    }
    return `${this.firstName} ${this.lastName}`;
  }

  @Type(() => OrganizationDTO)
  @ValidateNested()
  // This should always be populated in the database, but we don't always need it on the frontend.
  @IsOptional()
  organization?: OrganizationDTO;

  @IsPhoneNumber("CA")
  phoneNumber!: string;
}

export class ContactsDTO extends createDTOBase("Contacts") {
  @Type(() => ContactDTO)
  @ValidateNested({ each: true })
  @IsArray()
  contacts!: ContactDTO[];
}

export class CreateContactRequestDTO extends createDTOBase(
  "CreateContactRequest",
) {
  @IsEmail()
  email!: string;

  @IsString()
  @IsOptional()
  @Length(24, 32)
  gvote_id?: string;

  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsOptional()
  middleName?: string;

  @IsNotEmpty()
  lastName!: string;

  @IsPhoneNumber("CA")
  phoneNumber!: string;

  @IsInt()
  @Min(1)
  organizationId!: number;
}

export class CreateBulkContactRequestDTO extends createDTOBase(
  "CreateBulkContactRequest",
) {
  @ValidateNested({ each: true })
  @Type(() => CreateContactRequestDTO)
  contacts!: CreateContactRequestDTO[];
}

export class CreateBulkContactResponseDTO extends createDTOBase(
  "CreateBulkContactResponse",
) {
  ids!: number[];
}

export class GetContactByIDResponseDTO extends createDTOBase(
  "GetContactByIDResponse",
) {
  @ValidateNested()
  @IsOptional()
  contact!: ContactDTO | null;
}

export class ContactSearchRequestDTO extends createDTOBase(
  "ContactSearchRequest",
) {
  @IsOptional()
  @Transform(({ value }: { value: string | undefined }) => {
    if (value === "" || value === undefined) {
      return undefined;
    }
    // This happens pre-validation. If "value" can't be turned into a number,
    // NaN is returned, which will violate the "Min(1)" constraint.
    return Number(value);
  })
  @IsInt()
  @Min(1)
  id?: number;
  @IsOptional()
  email?: string;
  @IsOptional()
  firstName?: string;
  @IsOptional()
  lastName?: string;
  @IsOptional()
  organizationId?: number;
  @IsOptional()
  phoneNumber?: string;
}

export class PaginatedContactSearchRequestDTO extends createDTOBase(
  "PaginatedContactSearchRequest",
) {
  @ValidateNested()
  @Type(() => ContactSearchRequestDTO)
  contact!: ContactSearchRequestDTO;

  @ValidateNested()
  @Type(() => PaginatedRequestDTO)
  paginated!: PaginatedRequestDTO;
}

export class PaginatedContactResponseDTO extends createDTOBase(
  "PaginatedContactResponse",
) {
  @ValidateNested({ each: true })
  @Type(() => ContactDTO)
  @IsArray()
  contacts!: ContactDTO[];

  @ValidateNested()
  @Type(() => PaginatedResponseDTO)
  paginated!: PaginatedResponseDTO;

  static empty(): PaginatedContactResponseDTO {
    return PaginatedContactResponseDTO.from({
      contacts: [],
      paginated: {
        rowsSkipped: 0,
        rowsTotal: 0,
      },
    });
  }
}
