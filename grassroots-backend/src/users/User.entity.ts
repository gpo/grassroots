import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { createEntityBase } from "../util/CreateEntityBase";
import { UserDTO } from "../grassroots-shared/User.dto";

@Entity()
export class UserEntity extends createEntityBase<"UserEntity", UserDTO>() {
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
    return UserDTO.from({
      id: this.id,
      emails: this.emails,
      firstName: this.firstName,
      lastName: this.lastName,
      displayName: this.displayName,
    });
  }
}
