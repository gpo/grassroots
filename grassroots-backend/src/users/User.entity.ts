import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { UserDTO } from "../grassroots-shared/User.dto";
import { AssertPropsEqual } from "../grassroots-shared/util/TypesEqual";
import { PropsOf } from "../grassroots-shared/util/PropsOf";

@Entity()
export class UserEntity implements PropsOf<UserDTO> {
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

  foo!: number;
}

export type Check = AssertPropsEqual<UserDTO, UserEntity>;
