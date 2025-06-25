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

export class ContactResponseDTO {
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

export class CreateContactRequestDto {
  @IsEmail()
  email!: string;
  @IsNotEmpty()
  firstName!: string;
  @IsNotEmpty()
  lastName!: string;
  @IsPhoneNumber("CA")
  phoneNumber!: string;
}

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
  contact!: ContactResponseDTO | null;
}

export class ContactSearchRequestDTO {
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
  phoneNumber?: string;
}

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
  @Type(() => ContactResponseDTO)
  @IsArray()
  contacts!: ContactResponseDTO[];

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
