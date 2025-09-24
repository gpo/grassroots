import { Collection, Entity, OneToMany, PrimaryKey } from "@mikro-orm/core";
import { createEntityBase } from "../../util/CreateEntityBase.js";
import { PhoneCanvassDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { PhoneCanvassToContactEntity } from "./PhoneCanvassToContact.entity.js";

@Entity()
export class PhoneCanvassEntity extends createEntityBase<
  "PhoneCanvass",
  PhoneCanvassDTO
>("PhoneCanvass") {
  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  id!: string;

  creatorEmail!: string;

  @OneToMany(
    () => PhoneCanvassToContactEntity,
    (contact) => contact.phoneCanvas,
  )
  contacts = new Collection<PhoneCanvassToContactEntity>(this);
}
