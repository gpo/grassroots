import { Entity, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { UserDTO } from "../grassroots-shared/User.dto";
import { PropsOf } from "../grassroots-shared/util/PropsOf";
import { UserRoleEntity } from "./UserRole.entity";

@Entity()
export class UserEntity implements Omit<PropsOf<UserDTO>, "roles"> {
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

  @OneToMany(() => UserRoleEntity, (e) => e.user)
  roles!: UserRoleEntity[];
}
