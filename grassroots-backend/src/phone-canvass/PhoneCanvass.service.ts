import { Injectable } from "@nestjs/common";
import { PhoneCanvassEntity } from "./entities/PhoneCanvass.entity.js";
import { EntityManager, EntityRepository } from "@mikro-orm/core";
import {
  CreatePhoneCanvassRequestDTO,
  CreatePhoneCanvassResponseDTO,
  PhoneCanvassProgressInfoResponseDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { ContactEntity } from "../contacts/entities/Contact.entity.js";
import { PhoneCanvassToContactEntity } from "./entities/PhoneCanvassToContact.entity.js";

@Injectable()
export class PhoneCanvassService {
  repo: EntityRepository<PhoneCanvassEntity>;
  constructor(private readonly entityManager: EntityManager) {
    this.repo =
      entityManager.getRepository<PhoneCanvassEntity>(PhoneCanvassEntity);
  }
  // Returns the id of the new phone canvass.
  async create(
    canvass: CreatePhoneCanvassRequestDTO,
    creatorEmail: string,
  ): Promise<CreatePhoneCanvassResponseDTO> {
    const canvassEntity = this.repo.create({
      creatorEmail,
      contacts: [],
    });

    canvass.contacts.forEach((x) => {
      this.entityManager.create(PhoneCanvassToContactEntity, {
        phoneCanvas: canvassEntity,
        metadata: x.metadata,
        callStatus: "NOT_STARTED",
        contact: ContactEntity.fromCreateContactRequestDTO(x.contact),
      });
    });

    await this.entityManager.flush();

    return CreatePhoneCanvassResponseDTO.from({
      id: canvassEntity.id,
    });
  }

  async getProgressInfo(
    id: string,
  ): Promise<PhoneCanvassProgressInfoResponseDTO> {
    const count = await this.repo.count({ id });
    return PhoneCanvassProgressInfoResponseDTO.from({
      count,
    });
  }
}
