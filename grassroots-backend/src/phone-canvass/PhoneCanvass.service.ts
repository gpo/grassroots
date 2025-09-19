import { Injectable } from "@nestjs/common";
import { PhoneCanvassEntity } from "./entities/PhoneCanvass.entity.js";
import { EntityManager, EntityRepository } from "@mikro-orm/core";
import {
  CreatePhoneCanvassRequestDTO,
  CreatePhoneCanvassResponseDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";

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
  ): Promise<CreatePhoneCanvassResponseDTO> {
    const canvassEntity = this.repo.create(canvass);
    await this.entityManager.flush();
    console.log(canvassEntity);

    return CreatePhoneCanvassResponseDTO.from({
      id: canvassEntity.id,
    });
  }
}
