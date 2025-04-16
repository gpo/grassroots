import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
  ValidateNested,
} from "class-validator";
import { PaginatedInDTO, PaginatedOutDTO } from "./paginated.dto";

export class PendingContactInDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  firstName!: string;

  @IsNotEmpty()
  lastName!: string;
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
}

export class ContactSearchInDTO {
  @IsOptional()
  @IsInt()
  @Min(0)
  id?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
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
