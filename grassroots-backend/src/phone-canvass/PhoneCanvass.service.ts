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
  PhoneCanvassParticipantIdentityDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { ContactEntity } from "../contacts/entities/Contact.entity.js";
import { TwilioService } from "./Twilio.service.js";
import { PhoneCanvassContactEntity } from "./entities/PhoneCanvassContact.entity.js";
import type { Express } from "express";

@Injectable()
export class PhoneCanvassService {
  repo: EntityRepository<PhoneCanvassEntity>;
  constructor(
    private readonly entityManager: EntityManager,
    private twilioService: TwilioService,
    private readonly globalState: PhoneCanvassGlobalStateService,
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

    if (audioFile != null) {
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
    await this.updateSyncData(canvassEntity.id);

    return CreatePhoneCanvassResponseDTO.from({
      id: canvassEntity.id,
    });
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

  async getPhoneCanvassContacts(id: string): Promise<PhoneCanvassContactDTO[]> {
    const canvass = await this.getPhoneCanvassByIdOrFail(id);
    await canvass.contacts.init({ populate: ["contact"] });
    return canvass.contacts.map((x) => {
      return x.toDTO();
    });
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

  async updateSyncData(phoneCanvassId: string): Promise<void> {
    const contacts = await this.getPhoneCanvassContacts(phoneCanvassId);

    const partitionedContacts = partition(contacts, (contact) => {
      if (contact.callStatus === "NOT_STARTED") {
        return "NOT_STARTED";
      } else if (contact.callStatus === "STARTED") {
        return "STARTED";
      }
      return "COMPLETE";
    });

    const activeCalls: ActiveCall[] = (
      partitionedContacts.get("STARTED") ?? []
    ).map((contact) => {
      return {
        calleeDisplayName: contact.contact.formatName(),
        calleeId: contact.contact.id,
        callerName: "TODO",
      };
    });
    const pendingCalls: PendingCall[] = (
      partitionedContacts.get("NOT_STARTED") ?? []
    ).map((contact) => {
      return {
        calleeDisplayName: contact.contact.formatName(),
        calleeId: contact.contact.id,
      };
    });

    await this.twilioService.setSyncData(phoneCanvassId, {
      participants: this.globalState
        .listParticipants(phoneCanvassId)
        .map((x) => {
          return { displayName: x.displayName, ready: x.ready };
        }),
      activeCalls,
      pendingCalls,
    });
  }

  async addParticipant(
    identity: PhoneCanvassParticipantIdentityDTO,
  ): Promise<PhoneCanvassParticipantIdentityDTO> {
    this.globalState.addParticipant(identity);
    await this.updateSyncData(identity.activePhoneCanvassId);
    return identity;
  }

  async updateParticipant(
    identity: PhoneCanvassParticipantIdentityDTO,
  ): Promise<PhoneCanvassParticipantIdentityDTO> {
    this.globalState.updateParticipant(identity);
    await this.updateSyncData(identity.activePhoneCanvassId);
    return identity;
  }
}
