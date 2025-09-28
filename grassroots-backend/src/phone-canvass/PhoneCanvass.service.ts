import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PhoneCanvassEntity } from "./entities/PhoneCanvass.entity.js";
import { EntityManager, EntityRepository } from "@mikro-orm/core";
import {
  CreatePhoneCanvassRequestDTO,
  CreatePhoneCanvassResponseDTO,
  PhoneCanvassAuthTokenResponseDTO,
  PhoneCanvassProgressInfoResponseDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { ContactEntity } from "../contacts/entities/Contact.entity.js";
import { PhoneCanvassToContactEntity } from "./entities/PhoneCanvassToContact.entity.js";
import { TwilioService } from "./Twilio.service.js";
import { VoidDTO } from "grassroots-shared/dtos/Void.dto";

@Injectable()
export class PhoneCanvassService {
  repo: EntityRepository<PhoneCanvassEntity>;
  constructor(
    private readonly entityManager: EntityManager,
    private twilioService: TwilioService,
  ) {
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

  async startCanvass(id: string): Promise<VoidDTO> {
    const phoneCanvass = await this.repo.findOne({ id });
    if (phoneCanvass === null) {
      console.log("TODO: fail");
      //throw new UnauthorizedException("Invalid phone canvass id");
    }
    await this.twilioService.startCanvass();
    return VoidDTO.from({});
  }

  async getAuthToken(id: string): Promise<PhoneCanvassAuthTokenResponseDTO> {
    const phoneCanvass = await this.repo.findOne({ id });
    if (phoneCanvass === null) {
      console.log("TODO: fail");
      //throw new UnauthorizedException("Invalid phone canvass id");
    }
    return this.twilioService.getAuthToken();
  }

  async existsOrFail(id: string): Promise<void> {
    const phoneCanvass = await this.repo.findOne({ id });
    if (phoneCanvass === null) {
      throw new UnauthorizedException("Invalid phone canvass id");
    }
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
