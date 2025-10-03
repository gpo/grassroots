import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { createEntityBase } from "../util/CreateEntityBase.js";
import { UserDTO } from "grassroots-shared/dtos/User.dto";
import { UserRoleEntity } from "./UserRole.entity.js";

@Entity()
export class UserEntity extends createEntityBase<"User", UserDTO>("User") {
  @PrimaryKey()
  id!: string;
  @Property({ type: "json" })
  emails!: string[];
  @Property({ nullable: true })
  firstName?: string;
  @Property({ nullable: true })
  lastName?: string;
  @Property({ nullable: true })
  displayName?: string;

  @OneToMany(() => UserRoleEntity, (e) => e.user, { eager: true })
  userRoles = new Collection<UserRoleEntity>(this);

  toDTO(): UserDTO {
    return UserDTO.from({
      id: this.id,
      emails: this.emails,
      firstName: this.firstName,
      lastName: this.lastName,
      displayName: this.displayName,
      userRoles: this.userRoles,
    });
  }
}
