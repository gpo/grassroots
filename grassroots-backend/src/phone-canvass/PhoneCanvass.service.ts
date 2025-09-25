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
    await this.entityManager.flush();

    canvass.contacts.forEach((canvasContact) => {
      this.entityManager.create(PhoneCanvassToContactEntity, {
        phoneCanvas: canvassEntity,
        metadata: canvasContact.metadata,
        callStatus: "NOT_STARTED",
        contact: ContactEntity.fromCreateContactRequestDTO(
          canvasContact.contact,
        ),
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
    const canvass = await this.repo.findOneOrFail({ id });
    return PhoneCanvassProgressInfoResponseDTO.from({
      count: canvass.contacts.length,
    });
  }
}
