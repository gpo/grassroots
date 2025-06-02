import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  Min,
  ValidateNested,
} from "class-validator";
import { PaginatedInDTO, PaginatedOutDTO } from "./Paginated.dto";
import { Transform } from "class-transformer";
import { Entity, PrimaryKey, Property, Unique } from "@mikro-orm/core";
import "reflect-metadata";

export class CreateContactInDto {
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
  @ValidateNested()
  contacts!: CreateContactInDto[];
}

export class CreateBulkContactResponseDTO {
  ids!: number[];
}

@Entity()
export class ContactEntityOutDTO {
  @PrimaryKey()
  @IsInt()
  @Min(1)
  id!: number;

  @Property()
  @Unique()
  @IsEmail()
  email!: string;

  @Property()
  @IsNotEmpty()
  firstName!: string;

  @Property()
  @IsNotEmpty()
  lastName!: string;

  @Property()
  @IsPhoneNumber("CA")
  phoneNumber!: string;
}

export class GetContactByIDResponse {
  @ValidateNested()
  contact!: ContactEntityOutDTO | null;
}

export class ContactSearchInDTO {
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
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export class PaginatedContactSearchInDTO {
  @ValidateNested()
  contact!: ContactSearchInDTO;
  @ValidateNested()
  paginated!: PaginatedInDTO;
}

export class PaginatedContactOutDTO {
  @ValidateNested()
  contacts!: ContactEntityOutDTO[];
  @ValidateNested()
  paginated!: PaginatedOutDTO;

  static empty(): PaginatedContactOutDTO {
    return {
      contacts: [],
      paginated: {
        rowsSkipped: 0,
        rowsTotal: 0,
      },
    };
  }
}
