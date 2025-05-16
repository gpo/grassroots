import { Entity } from "typeorm";

@Entity()
export class User {
  email!: string;
  password?: string;
}
