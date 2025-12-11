import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { createEntityBase } from "../../util/CreateEntityBase.js";
import { PhoneCanvassDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { PhoneCanvassContactEntity } from "./PhoneCanvassContact.entity.js";

@Entity()
export class PhoneCanvassEntity extends createEntityBase<
  "PhoneCanvass",
  PhoneCanvassDTO
>("PhoneCanvass") {
  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  id!: string;

  @Property()
  creatorEmail!: string;

  @Property()
  name!: string;

  @OneToMany(() => PhoneCanvassContactEntity, (contact) => contact.phoneCanvass)
  contacts = new Collection<PhoneCanvassContactEntity>(this);

  // Last time we sent out a sync update (approximately), or
  // creation time if we haven't sent any sync updates.
  @Property()
  lastSyncUpdate!: Date;
}
