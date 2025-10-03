import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";

import type { Rel } from "@mikro-orm/core";
import { createEntityBase } from "../../util/CreateEntityBase.js";
import { PhoneCanvassEntity } from "./PhoneCanvass.entity.js";
import { ContactEntity } from "../../contacts/entities/Contact.entity.js";
import type { CallStatus } from "grassroots-shared/dtos/PhoneCanvass/CallStatus.dto";
import type { PhoneCanvassToContactDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";

@Entity()
export class PhoneCanvassToContactEntity extends createEntityBase<
  "PhoneCanvassToContact",
  PhoneCanvassToContactDTO
>("PhoneCanvassToContact") {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => PhoneCanvassEntity)
  phoneCanvas!: Rel<PhoneCanvassEntity>;

  @Property({ type: "json" })
  metadata!: string;

  @Property()
  callStatus!: CallStatus;

  @ManyToOne()
  contact!: ContactEntity;
}
