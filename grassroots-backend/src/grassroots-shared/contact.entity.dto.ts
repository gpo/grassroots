import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsPhoneNumber,
  Min,
} from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
