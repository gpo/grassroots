import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";

import type { Opt, Rel } from "@mikro-orm/core";
import { createEntityBase } from "../../util/CreateEntityBase.js";
import { PhoneCanvassEntity } from "./PhoneCanvass.entity.js";
import { ContactEntity } from "../../contacts/entities/Contact.entity.js";
import type { CallResult } from "grassroots-shared/dtos/PhoneCanvass/CallStatus.dto";
import { PhoneCanvassContactDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";

@Entity()
export class PhoneCanvassContactEntity extends createEntityBase<
  "PhoneCanvassContact",
  PhoneCanvassContactDTO
>("PhoneCanvassContact") {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => PhoneCanvassEntity)
  phoneCanvas!: Rel<PhoneCanvassEntity>;

  // TODO: Most of this should probably into real fields on the ContactEntity.
  @Property({ type: "json" })
  metadata!: string;

  @Property()
  beenCalled!: boolean;

  @Property({ nullable: true })
  callResult?: CallResult;

  @Property()
  playedVoicemail: boolean & Opt = false;

  @ManyToOne()
  contact!: ContactEntity;

  toDTO(): PhoneCanvassContactDTO {
    return PhoneCanvassContactDTO.from({
      contact: this.contact.toDTO(),
      metadata: this.metadata,
      callStatus: this.beenCalled ? "COMPLETED" : "NOT_STARTED",
    });
  }
}
