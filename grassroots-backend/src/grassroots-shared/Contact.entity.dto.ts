import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  Min,
  ValidateNested,
} from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { PaginatedInDTO, PaginatedOutDTO } from "./Paginated.dto";
import { Transform } from "class-transformer";

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
  contacts!: CreateContactInDto[];
}

export class CreateBulkContactResponseDTO {
  ids!: number[];
}

@Entity()
export class ContactEntityOutDTO {
  @PrimaryGeneratedColumn()
  @IsInt()
  @Min(0)
  id!: number;

  @Column()
  @IsEmail()
  email!: string;

  @Column()
  @IsNotEmpty()
  firstName!: string;

  @Column()
  @IsNotEmpty()
  lastName!: string;

  @Column()
  @IsPhoneNumber("CA")
  phoneNumber!: string;
}

export class GetContactByIDResponse {
  @ValidateNested()
  contact!: ContactEntityOutDTO | null;
}

export class ContactSearchInDTO {
  @IsOptional()
  @Transform(({ value }: { value: string }) =>
    value === "" ? undefined : Number(value),
  )
  @IsInt()
  @Min(0)
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
