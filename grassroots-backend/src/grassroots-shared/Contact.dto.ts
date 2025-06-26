import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  Min,
  ValidateNested,
} from "class-validator";
import { PaginatedRequestDTO, PaginatedResponseDTO } from "./Paginated.dto";
import "reflect-metadata";
import { IntersectionType, OmitType, PartialType } from "@nestjs/mapped-types";

export class ContactDTO {
  @IsInt()
  @Min(1)
  id!: number;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  firstName!: string;

  @IsNotEmpty()
  lastName!: string;

  @IsPhoneNumber("CA")
  phoneNumber!: string;
}

export class CreateContactRequestDto extends OmitType(ContactDTO, ["id"]) {}

export class CreateBulkContactRequestDto {
  @ValidateNested({ each: true })
  @Type(() => CreateContactRequestDto)
  contacts!: CreateContactRequestDto[];
}

export class CreateBulkContactResponseDTO {
  ids!: number[];
}

export class GetContactByIDResponseDTO {
  @ValidateNested()
  @IsOptional()
  contact!: ContactDTO | null;
}

class ContactSearchRequestId {
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
}

export class ContactSearchRequestDTO extends IntersectionType(
  OmitType(PartialType(ContactDTO), ["id"]),
  ContactSearchRequestId,
) {}

export class PaginatedContactSearchRequestDTO {
  @ValidateNested()
  @Type(() => ContactSearchRequestDTO)
  contact!: ContactSearchRequestDTO;

  @ValidateNested()
  @Type(() => PaginatedRequestDTO)
  paginated!: PaginatedRequestDTO;
}

export class PaginatedContactResponseDTO {
  @ValidateNested({ each: true })
  @Type(() => ContactDTO)
  @IsArray()
  contacts!: ContactDTO[];

  @ValidateNested()
  @Type(() => PaginatedResponseDTO)
  paginated!: PaginatedResponseDTO;

  static empty(): PaginatedContactResponseDTO {
    return {
      contacts: [],
      paginated: {
        rowsSkipped: 0,
        rowsTotal: 0,
      },
    };
  }
}
