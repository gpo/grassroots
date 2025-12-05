import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { PhoneCanvassEntity } from "./entities/PhoneCanvass.entity.js";
import {
  EntityManager,
  EntityRepository,
  Loaded,
  RequiredEntityData,
} from "@mikro-orm/core";
import {
  CreatePhoneCanvassRequestDTO,
  CreatePhoneCanvassResponseDTO,
  PaginatedPhoneCanvassContactListRequestDTO,
  PaginatedPhoneCanvassContactResponseDTO,
  PhoneCanvassProgressInfoResponseDTO,
  PhoneCanvassContactDTO,
  PhoneCanvassDetailsDTO,
  PhoneCanvasTwilioCallAnsweredCallbackDTO,
  PhoneCanvasOverrideAnsweredByMachineDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { ContactEntity } from "../contacts/entities/Contact.entity.js";
import { TwilioService } from "./Twilio.service.js";
import { PhoneCanvassContactEntity } from "./entities/PhoneCanvassContact.entity.js";
import { PhoneCanvassModelFactory } from "./Scheduler/PhoneCanvassModelFactory.js";
import { ServerMetaService } from "../server-meta/ServerMeta.service.js";
import { InjectRepository } from "@mikro-orm/nestjs";
import { writeFile } from "fs/promises";
import path from "path";
import { VOICEMAIL_STORAGE_DIR } from "./PhoneCanvass.module.js";
import { PhoneCanvassModel } from "./PhoneCanvass.model.js";
import { Call } from "./Scheduler/PhoneCanvassCall.js";

@Injectable()
export class PhoneCanvassService {
  // From phone canvass id.
  #models = new Map<string, PhoneCanvassModel>();
  #callsBySid = new Map<string, Call>();
  #callsByContactId = new Map<number, Call>();

  constructor(
    private readonly entityManager: EntityManager,
    private twilioService: TwilioService,
    private readonly phoneCanvassModelFactory: PhoneCanvassModelFactory,
    private readonly serverMetaService: ServerMetaService,
    @InjectRepository(PhoneCanvassEntity)
    private readonly repo: EntityRepository<PhoneCanvassEntity>,
  ) {
    twilioService.setGetCallsBySID((sid: string): Call | undefined => {
      return this.#callsBySid.get(sid);
    });
  }

  async startSimulating(phoneCanvassId: string): Promise<void> {
    const model = await this.getInitiatedModelFor({ phoneCanvassId });
    await model.startSimulating();
  }

  // Returns the id of the new phone canvass.
  async create(
    canvass: CreatePhoneCanvassRequestDTO,
    creatorEmail: string,
    audioFile: Express.Multer.File,
  ): Promise<CreatePhoneCanvassResponseDTO> {
    const canvassEntity = this.repo.create({
      name: canvass.name,
      creatorEmail,
      contacts: [],
    });
    await this.entityManager.flush();

    for (const canvasContact of canvass.contacts) {
      const contact: RequiredEntityData<ContactEntity> =
        ContactEntity.fromCreateContactRequestDTO(canvasContact.contact);

      this.entityManager.create(PhoneCanvassContactEntity, {
        phoneCanvass: canvassEntity,
        metadata: canvasContact.metadata,
        beenCalled: false,
        contact,
        notes: "",
      });
    }

    await this.entityManager.flush();

    const newCanvass = CreatePhoneCanvassResponseDTO.from({
      id: canvassEntity.id,
    });

    const audioFileExtension = path
      .extname(audioFile.originalname)
      .toLowerCase();

    await writeFile(
      VOICEMAIL_STORAGE_DIR + "/" + newCanvass.id + audioFileExtension,
      audioFile.buffer,
    );

    await this.getInitiatedModelFor({ phoneCanvassId: canvassEntity.id });

    return newCanvass;
  }

  async getPhoneCanvassByIdOrFail(
    id: string,
  ): Promise<Loaded<PhoneCanvassEntity>> {
    const phoneCanvass = await this.repo.findOne({ id });
    if (phoneCanvass === null) {
      throw new UnauthorizedException("Invalid phone canvass id");
    }
    return phoneCanvass;
  }

  async getPhoneCanvassContacts(
    id: string,
  ): Promise<Loaded<PhoneCanvassContactEntity, "contact">[]> {
    const phoneCanvass = await this.repo.findOne(
      { id },
      {
        populate: ["contacts.contact"],
      },
    );
    if (phoneCanvass === null) {
      throw new UnauthorizedException("Invalid phone canvass id");
    }
    return phoneCanvass.contacts.getItems();
  }

  async getProgressInfo(
    id: string,
  ): Promise<PhoneCanvassProgressInfoResponseDTO> {
    const canvass = await this.getPhoneCanvassByIdOrFail(id);
    return PhoneCanvassProgressInfoResponseDTO.from({
      count: canvass.contacts.length,
    });
  }

  async getDetails(id: string): Promise<PhoneCanvassDetailsDTO> {
    await this.getInitiatedModelFor({ phoneCanvassId: id });
    const canvass = await this.getPhoneCanvassByIdOrFail(id);
    return PhoneCanvassDetailsDTO.from({
      name: canvass.name,
    });
  }

  // Security here comes from the comparison with the phone canvass id.
  // If an attacker knows a phone canvass id, they can likely guess a contact id.
  async #getContact(params: {
    phoneCanvassId: string;
    phoneCanvassContactId: number;
  }): Promise<PhoneCanvassContactEntity> {
    const contact = await this.repo
      .getEntityManager()
      .findOne(
        PhoneCanvassContactEntity,
        { phoneCanvassContactId: params.phoneCanvassContactId },
        { populate: ["contact", "phoneCanvass"] },
      );
    if (contact === null || contact.phoneCanvass.id !== params.phoneCanvassId) {
      throw new NotFoundException("Unable to find contact.");
    }
    return contact;
  }

  // Security here comes from the comparison with the phone canvass id.
  // If an attacker knows a phone canvass id, they can likely guess a contact id.
  async getContactByRawContactId(params: {
    phoneCanvassId: string;
    rawContactId: number;
  }): Promise<PhoneCanvassContactEntity> {
    const contact = await this.repo
      .getEntityManager()
      .findOne(
        PhoneCanvassContactEntity,
        { contact: { id: params.rawContactId } },
        { populate: ["contact"] },
      );
    if (contact === null || contact.phoneCanvass.id !== params.phoneCanvassId) {
      throw new NotFoundException("Unable to find contact.");
    }
    return contact;
  }

  async getContact(params: {
    phoneCanvassId: string;
    phoneCanvassContactId: number;
  }): Promise<PhoneCanvassContactDTO> {
    return (await this.#getContact(params)).toDTO();
  }

  async updateContactNotes(params: {
    phoneCanvassId: string;
    phoneCanvassContactId: number;
    notes: string;
  }): Promise<PhoneCanvassContactDTO> {
    const contact = await this.#getContact(params);
    const em = this.repo.getEntityManager();
    contact.notes = params.notes;
    await em.flush();
    return contact.toDTO();
  }

  async list({
    phoneCanvassId,
    paginated,
  }: PaginatedPhoneCanvassContactListRequestDTO): Promise<PaginatedPhoneCanvassContactResponseDTO> {
    const [result, rowsTotal] = await this.entityManager.findAndCount(
      PhoneCanvassContactEntity,
      { phoneCanvass: phoneCanvassId },
      {
        limit: paginated.rowsToTake,
        offset: paginated.rowsToSkip,
        populate: ["contact"],
      },
    );

    return PaginatedPhoneCanvassContactResponseDTO.from({
      contacts: result.map((x) => x.toDTO()),
      paginated: {
        rowsSkipped: paginated.rowsToSkip,
        rowsTotal,
      },
    });
  }

  async getInitiatedModelFor(params: {
    phoneCanvassId: string;
  }): Promise<PhoneCanvassModel> {
    const { phoneCanvassId } = params;

    let model = this.#models.get(phoneCanvassId);
    if (model === undefined) {
      const contacts = await this.getPhoneCanvassContacts(phoneCanvassId);
      model = this.phoneCanvassModelFactory.createModel({
        contacts: contacts,
        phoneCanvassId: phoneCanvassId,
        twilioService: this.twilioService,
        serverMetaService: this.serverMetaService,
        entityManager: this.entityManager,
      });
      this.#models.set(phoneCanvassId, model);

      model.calls$.subscribe((call) => {
        if (call.twilioSid !== undefined) {
          this.#callsBySid.set(call.twilioSid, call);
        }
        this.#callsByContactId.set(call.phoneCanvassContactId, call);
      });
    }
    return model;
  }

  // If the server dies, we could end up with a bunch of stale
  // twilio sync data. Clear this on restart.
  async clearTwilioSyncDatas(): Promise<void> {
    const canvasses = await this.repo.findAll();
    await Promise.all(
      canvasses.map((canvass) => {
        return (async (): Promise<void> => {
          await this.twilioService.clearSyncData(canvass.id);
        })();
      }),
    );
  }

  async twilioCallAnsweredCallback(
    callback: PhoneCanvasTwilioCallAnsweredCallbackDTO,
  ): Promise<string> {
    const call = this.getCallBySid(callback.CallSid);
    const model = await this.getInitiatedModelFor({
      phoneCanvassId: call.canvassId,
    });
    return this.twilioService.twilioCallAnsweredCallback(
      callback,
      call,
      model.scheduler,
    );
  }

  overrideAnsweredByMachine(
    override: PhoneCanvasOverrideAnsweredByMachineDTO,
  ): void {
    const call = this.#callsByContactId.get(override.contactId);
    if (call === undefined || call.canvassId !== override.phoneCanvassId) {
      throw new Error("Unable find call");
    }
    call.update("COMPLETED", { overrideAnsweredByMachine: true });
  }

  getCallBySid(sid: string): Call {
    const call = this.#callsBySid.get(sid);
    if (call === undefined) {
      throw new NotFoundException(`Can't find call with sid ${sid}`);
    }
    return call;
  }
}
