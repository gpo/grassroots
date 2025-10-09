import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PhoneCanvassEntity } from "./entities/PhoneCanvass.entity.js";
import {
  EntityManager,
  EntityRepository,
  RequiredEntityData,
} from "@mikro-orm/core";
import {
  CreatePhoneCanvassRequestDTO,
  CreatePhoneCanvassResponseDTO,
  PhoneCanvassAuthTokenResponseDTO,
  PaginatedPhoneCanvassContactListRequestDTO,
  PaginatedPhoneCanvassContactResponseDTO,
  PhoneCanvassProgressInfoResponseDTO,
  PhoneCanvassContactDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { ContactEntity } from "../contacts/entities/Contact.entity.js";
import { TwilioService } from "./Twilio.service.js";
import { VoidDTO } from "grassroots-shared/dtos/Void.dto";
import { PhoneCanvassContactEntity } from "./entities/PhoneCanvassContact.entity.js";
import type { Express } from "express";

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
    audioFile?: Express.Multer.File,
  ): Promise<CreatePhoneCanvassResponseDTO> {
    console.log(
      "Service create called with audioFile:",
      audioFile ? "YES" : "NO",
    );
    const canvassEntity = this.repo.create({
      creatorEmail,
      contacts: [],
    });
    await this.entityManager.flush();

    if (audioFile != null && audioFile != undefined) {
      console.log(
        "Service received audio file:",
        audioFile.originalname,
        audioFile.size,
      );
    }

    for (const canvasContact of canvass.contacts) {
      const contact: RequiredEntityData<ContactEntity> =
        ContactEntity.fromCreateContactRequestDTO(canvasContact.contact);

      this.entityManager.create(PhoneCanvassContactEntity, {
        phoneCanvas: canvassEntity,
        metadata: canvasContact.metadata,
        callStatus: "NOT_STARTED",
        contact,
      });
    }

    await this.entityManager.flush();

    return CreatePhoneCanvassResponseDTO.from({
      id: canvassEntity.id,
    });
  }

  async startCanvass(id: string): Promise<VoidDTO> {
    const canvass = await this.getPhoneCanvassByIdOrFail(id);
    await canvass.contacts.init({ populate: ["contact"] });
    const contacts = canvass.contacts.map((x) => {
      return x.toDTO();
    });

    await this.twilioService.startCanvass(id, contacts);
    return VoidDTO.from({});
  }

  async getAuthToken(id: string): Promise<PhoneCanvassAuthTokenResponseDTO> {
    await this.getPhoneCanvassByIdOrFail(id);
    return this.twilioService.getAuthToken();
  }

  async getPhoneCanvassByIdOrFail(id: string): Promise<PhoneCanvassEntity> {
    const phoneCanvass = await this.repo.findOne({ id });
    if (phoneCanvass === null) {
      throw new UnauthorizedException("Invalid phone canvass id");
    }
    return phoneCanvass;
  }

  async getProgressInfo(
    id: string,
  ): Promise<PhoneCanvassProgressInfoResponseDTO> {
    const canvass = await this.getPhoneCanvassByIdOrFail(id);
    return PhoneCanvassProgressInfoResponseDTO.from({
      count: canvass.contacts.length,
    });
  }

  async list({
    phoneCanvassId,
    paginated,
  }: PaginatedPhoneCanvassContactListRequestDTO): Promise<PaginatedPhoneCanvassContactResponseDTO> {
    const [result, rowsTotal] = await this.entityManager.findAndCount(
      PhoneCanvassContactEntity,
      { phoneCanvas: phoneCanvassId },
      {
        limit: paginated.rowsToTake,
        offset: paginated.rowsToSkip,
        populate: ["contact"],
      },
    );

    return PaginatedPhoneCanvassContactResponseDTO.from({
      contacts: result.map((x) =>
        PhoneCanvassContactDTO.from({
          contact: x.contact.toDTO(),
          metadata: x.metadata,
          callStatus: x.callStatus,
        }),
      ),
      paginated: {
        rowsSkipped: paginated.rowsToSkip,
        rowsTotal,
      },
    });
  }
}
