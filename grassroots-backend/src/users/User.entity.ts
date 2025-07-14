import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { createBrandedEntity } from "../util/CreateBrandedEntity";
import { UserDTO } from "../grassroots-shared/User.dto";
import { plainToInstance } from "class-transformer";

@Entity()
export class UserEntity extends createBrandedEntity("UserEntity") {
  @PrimaryKey()
  id!: string;
  @Property({ type: "json", nullable: true })
  emails?: string[];
  @Property({ nullable: true })
  firstName?: string;
  @Property({ nullable: true })
  lastName?: string;
  @Property({ nullable: true })
  displayName?: string;

  toDTO(): UserDTO {
    return plainToInstance(UserDTO, {
      id: this.id,
      emails: this.emails,
      firstName: this.firstName,
      lastName: this.lastName,
      displayName: this.displayName,
    });
  }
}
