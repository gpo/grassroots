import { Entity, PrimaryKey } from "@mikro-orm/core";
import { createEntityBase } from "../../util/CreateEntityBase.js";
import { PhoneCanvassDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";

@Entity()
export class PhoneCanvassEntity extends createEntityBase<
  "PhoneCanvass",
  PhoneCanvassDTO
>("PhoneCanvass") {
  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  id!: string;
}
