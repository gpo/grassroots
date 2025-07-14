import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { createBrandedEntity } from "../util/CreateBrandedEntity";

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
}
