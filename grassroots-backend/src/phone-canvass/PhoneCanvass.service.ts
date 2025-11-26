import {
  ForbiddenException,
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
  PhoneCanvassCallerDTO,
  CreatePhoneCanvassCallerDTO,
  PhoneCanvassDetailsDTO,
  PhoneCanvasTwilioCallAnsweredCallbackDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { ContactEntity } from "../contacts/entities/Contact.entity.js";
import { TwilioService } from "./Twilio.service.js";
import { PhoneCanvassContactEntity } from "./entities/PhoneCanvassContact.entity.js";
import { PhoneCanvassCallersService } from "./PhoneCanvassCallers.service.js";
import type { Express } from "express";
import { callStatusSort } from "grassroots-shared/dtos/PhoneCanvass/CallStatus.dto";
import { PhoneCanvassScheduler } from "./Scheduler/PhoneCanvassScheduler.js";
import { Call } from "./Scheduler/PhoneCanvassCall.js";
import { PhoneCanvassSchedulerFactory } from "./Scheduler/PhoneCanvassSchedulerFactory.js";
import {
  PhoneCanvassSimulator,
  simulateMakeCall,
} from "./PhoneCanvassSimulator.js";
import { ServerMetaService } from "../server-meta/ServerMeta.service.js";
import {
  CallerSummary,
  ContactSummary,
  PhoneCanvassSyncData,
} from "grassroots-shared/PhoneCanvass/PhoneCanvassSyncData";
import { getEnvVars } from "../GetEnvVars.js";
import { InjectRepository } from "@mikro-orm/nestjs";
import { writeFile } from "fs/promises";
import path from "path";
import { VOICEMAIL_STORAGE_DIR } from "./PhoneCanvass.module.js";
import { combineLatest, Observable, tap } from "rxjs";
import { runPromise } from "grassroots-shared/util/RunPromise";

@Injectable()
export class PhoneCanvassService {
  #calls$ = new Observable<Call>();
  callsBySid = new Map<string, Call & { twilioSid: string }>();
  // From phone canvass id.
  #schedulers = new Map<string, PhoneCanvassScheduler>();
  // Only present if there's an active simulation.
  #simulator: PhoneCanvassSimulator | undefined;

  constructor(
    private readonly entityManager: EntityManager,
    private twilioService: TwilioService,
    private readonly callersService: PhoneCanvassCallersService,
    private readonly schedulerFactory: PhoneCanvassSchedulerFactory,
    private readonly serverMetaService: ServerMetaService,
    @InjectRepository(PhoneCanvassEntity)
    private readonly repo: EntityRepository<PhoneCanvassEntity>,
  ) {
    twilioService.setGetCallsBySID((sid: string): Call | undefined => {
      return this.callsBySid.get(sid);
    });

    this.#calls$.pipe(
      tap((call) => {
        // TODO(mvp), handle call complete for caller, update database, etc.
        if (call.status === "NOT_STARTED") {
          runPromise(
            (async (): Promise<void> => {
              const { sid, status } =
                this.#simulator?.phoneCanvassId !== call.canvassId
                  ? await this.twilioService.makeCall(call)
                  : simulateMakeCall(call);
              call.update(status, { twilioSid: sid });
            })(),
            false,
          );
        }
      }),
    );

    const allContacts$ = [...this.#schedulers.values()].map(
      (x) => x.pendingContacts$,
    );

    const syncData = combineLatest({
      callers: this.callersService.callers$,
      calls: this.#calls$,
      contacts: allContacts$,
    });
  }

  async startSimulating(phoneCanvassId: string): Promise<void> {
    if (!(await getEnvVars()).ENABLE_PHONE_CANVASS_SIMULATION) {
      throw new ForbiddenException(
        "Can't simulate a phone canvass without ENABLE_PHONE_CANVASS_SIMULATION",
      );
    }

    this.#simulator?.stop();

    const scheduler = await this.getInitializedScheduler({
      phoneCanvassId,
    });
    this.#simulator = new PhoneCanvassSimulator(
      this,
      phoneCanvassId,
      scheduler,
    );
    await this.#simulator.start();
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
        phoneCanvas: canvassEntity,
        metadata: canvasContact.metadata,
        beenCalled: false,
        contact,
      });
    }

    await this.entityManager.flush();

    await this.#updateSyncData(canvassEntity.id);

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
      { populate: ["contacts.contact"], refresh: true },
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
    const canvass = await this.getPhoneCanvassByIdOrFail(id);
    return PhoneCanvassDetailsDTO.from({
      name: canvass.name,
    });
  }

  async getContact(id: number): Promise<PhoneCanvassContactDTO> {
    const contact = await this.repo
      .getEntityManager()
      .findOneOrFail(
        PhoneCanvassContactEntity,
        { id },
        { populate: ["contact"] },
      );
    return contact.toDTO();
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
      contacts: result.map((x) => x.toDTO()),
      paginated: {
        rowsSkipped: paginated.rowsToSkip,
        rowsTotal,
      },
    });
  }

  async #updateSyncData(phoneCanvassId: string): Promise<void> {
    // TODO(mvp): consider exposing which caller is talking to which contact.
    const callers: CallerSummary[] = this.callersService
      .listCallers(phoneCanvassId)
      .map((x) => {
        return { displayName: x.displayName, ready: x.ready, callerId: x.id };
      });

    const contacts: ContactSummary[] = (
      await this.getPhoneCanvassContacts(phoneCanvassId)
    ).map((contact) => {
      const dto = contact.toDTO();
      return {
        contactDisplayName: dto.contact.formatName(),
        contactId: contact.contact.id,
        status: contact.callStatus,
        result: contact.callResult,
        // TODO: optimize, and assert there's only one value.
        callerId: [...this.callsBySid.values()]
          .filter((x) => x.contactId === contact.id)
          .map((x) => {
            if (x.status === "IN_PROGRESS") {
              return x.callerId;
            }
          })[0],
      };
    });

    const unfinishedContacts = contacts.filter((a) => a.status !== "COMPLETED");

    const upcomingContacts = unfinishedContacts
      .sort((a, b) => -callStatusSort(a.status, b.status))
      .slice(0, 20);

    const syncData = {
      callers,
      contacts: upcomingContacts,
      serverInstanceUUID: this.serverMetaService.instanceUUID,
      phoneCanvassId: phoneCanvassId,
      totalContacts: contacts.length,
      doneContacts: contacts.length - unfinishedContacts.length,
    } satisfies PhoneCanvassSyncData;

    await this.twilioService.setSyncData(phoneCanvassId, syncData);
  }

  async getInitializedScheduler(params: {
    phoneCanvassId: string;
  }): Promise<PhoneCanvassScheduler> {
    const { phoneCanvassId } = params;
    let scheduler = this.#schedulers.get(phoneCanvassId);
    if (scheduler === undefined) {
      const contacts = await this.getPhoneCanvassContacts(phoneCanvassId);
      scheduler = this.schedulerFactory.createScheduler({
        contacts: contacts,
        phoneCanvassId: phoneCanvassId,
        calls$: this.#calls$,
      });
      this.#schedulers.set(phoneCanvassId, scheduler);
    }
    return scheduler;
  }

  async registerCaller(
    caller: CreatePhoneCanvassCallerDTO,
  ): Promise<PhoneCanvassCallerDTO> {
    await this.getPhoneCanvassByIdOrFail(caller.activePhoneCanvassId);
    const newCaller = await this.callersService.registerCaller(
      caller,
      async (id) => await this.twilioService.getAuthToken(id),
    );

    await this.#updateSyncData(caller.activePhoneCanvassId);
    await this.getInitializedScheduler({
      phoneCanvassId: caller.activePhoneCanvassId,
    });
    return newCaller;
  }

  async refreshOrCreateCaller(
    caller: PhoneCanvassCallerDTO,
  ): Promise<PhoneCanvassCallerDTO> {
    await this.getPhoneCanvassByIdOrFail(caller.activePhoneCanvassId);
    const refreshedCaller = await this.callersService.refreshOrCreateCaller(
      caller,
      async (id) => await this.twilioService.getAuthToken(id),
    );

    await this.#updateSyncData(caller.activePhoneCanvassId);
    await this.getInitializedScheduler({
      phoneCanvassId: caller.activePhoneCanvassId,
    });
    return refreshedCaller;
  }

  async updateOrCreateCaller(
    caller: PhoneCanvassCallerDTO,
  ): Promise<PhoneCanvassCallerDTO> {
    await this.callersService.updateOrCreateCaller(
      caller,
      async (id) => await this.twilioService.getAuthToken(id),
    );
    const scheduler = await this.getInitializedScheduler({
      phoneCanvassId: caller.activePhoneCanvassId,
    });
    switch (caller.ready) {
      case "ready": {
        scheduler.addCaller(caller.id);
        break;
      }
      case "unready": {
        scheduler.removeCaller(caller.id);
        break;
      }
      case "last call": {
        // We handle this when a call completes.
      }
    }

    await this.#updateSyncData(caller.activePhoneCanvassId);
    return caller;
  }

  getCallBySid(sid: string): Call {
    const call = this.callsBySid.get(sid);
    if (call === undefined) {
      throw new Error(`Unable to get call. sid ${sid} doesn't exist.`);
    }
    return call;
  }

  // If the server dies, we could end up with a bunch of stale
  // twilio sync data. Clear this on restart.
  async clearTwilioSyncDatas(): Promise<void> {
    const canvasses = await this.repo.findAll();
    await Promise.all(
      canvasses.map((canvass) => {
        return (async (): Promise<void> => {
          await this.#updateSyncData(canvass.id);
        })();
      }),
    );
  }

  async twilioCallAnsweredCallback(
    callback: PhoneCanvasTwilioCallAnsweredCallbackDTO,
  ): Promise<string> {
    const call = this.callsBySid.get(callback.CallSid);
    if (!call) {
      throw new NotFoundException(
        `Can't find call with id ${callback.CallSid}`,
      );
    }
    const scheduler = await this.getInitializedScheduler({
      phoneCanvassId: call.canvassId,
    });
    return this.twilioService.twilioCallAnsweredCallback(
      callback,
      call,
      scheduler,
    );
  }
}
