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
  PhoneCanvassCallerDTO,
  CreatePhoneCanvassCallerDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { ContactEntity } from "../contacts/entities/Contact.entity.js";
import { TwilioService } from "./Twilio.service.js";
import { PhoneCanvassContactEntity } from "./entities/PhoneCanvassContact.entity.js";
import { PhoneCanvassGlobalStateService } from "./PhoneCanvassGlobalState.service.js";
import { partition } from "grassroots-shared/util/Partition";
import {
  ActiveCall,
  PendingCall,
} from "grassroots-shared/PhoneCanvass/PhoneCanvassSyncData";
import type { Express } from "express";
import {
  CallResult,
  CallStatus,
} from "grassroots-shared/dtos/PhoneCanvass/CallStatus.dto";

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

    const partitionedContacts = partition(
      contacts,
      (contact: PhoneCanvassContactDTO) => {
        if (
          contact.callStatus === "NOT_STARTED" ||
          contact.callStatus === "INITIATED" ||
          contact.callStatus === "QUEUED" ||
          contact.callStatus === "RINGING"
        ) {
          return "NOT_STARTED";
        } else if (contact.callStatus === "IN_PROGRESS") {
          return "IN_PROGRESS";
        }
        return "COMPLETE";
      },
    );

    const activeCalls: ActiveCall[] = (
      partitionedContacts.get("IN_PROGRESS") ?? []
    ).map((contact: PhoneCanvassContactDTO) => {
      return {
        calleeDisplayName: contact.contact.formatName(),
        calleeId: contact.contact.id,
        callerName: "TODO",
      };
    });
    const pendingCalls: PendingCall[] = (
      partitionedContacts.get("NOT_STARTED") ?? []
    ).map((contact: PhoneCanvassContactDTO) => {
      return {
        calleeDisplayName: contact.contact.formatName(),
        calleeId: contact.contact.id,
      };
    });

    await this.twilioService.setSyncData(phoneCanvassId, {
      callers: this.globalState.listCallers(phoneCanvassId).map((x) => {
        return { displayName: x.displayName, ready: x.ready };
      }),
      activeCalls,
      pendingCalls,
    });
  }

  async addCaller(
    caller: CreatePhoneCanvassCallerDTO,
  ): Promise<PhoneCanvassCallerDTO> {
    const newCaller = this.globalState.addCaller(caller);
    await this.updateSyncData(caller.activePhoneCanvassId);
    return newCaller;
  }

  async updateCaller(
    caller: PhoneCanvassCallerDTO,
  ): Promise<PhoneCanvassCallerDTO> {
    this.globalState.updateCaller(caller);
    await this.updateSyncData(caller.activePhoneCanvassId);
    return caller;
  }

  async updateCall(
    sid: string,
    state: { status: CallStatus; result?: CallResult },
  ): Promise<void> {
    this.calls;
  }
}
