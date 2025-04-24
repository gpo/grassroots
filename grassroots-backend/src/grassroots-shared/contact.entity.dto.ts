import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export class CreateContactInDto {
  email!: string;
  firstName!: string;
  lastName!: string;
}

@Entity()
export class ContactEntityOutDTO {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  email!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  phoneNumber!: string;
}
