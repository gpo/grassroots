import {
  ForbiddenException,
  Injectable,
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
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { ContactEntity } from "../contacts/entities/Contact.entity.js";
import { TwilioService } from "./Twilio.service.js";
import { PhoneCanvassContactEntity } from "./entities/PhoneCanvassContact.entity.js";
import { PhoneCanvassGlobalStateService } from "./PhoneCanvassGlobalState.service.js";
import type { Express } from "express";
import {
  CallResult,
  CallStatus,
  callStatusSort,
} from "grassroots-shared/dtos/PhoneCanvass/CallStatus.dto";
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
} from "grassroots-shared/PhoneCanvass/PhoneCanvassSyncData";
import { getEnvVars } from "../GetEnvVars.js";
import { InjectRepository } from "@mikro-orm/nestjs";

interface AdvanceCallToStatusParams {
  call: Call;
  status: CallStatus;
  result?: CallResult;
  currentTime: number;
  twilioSid: string;
  scheduler: PhoneCanvassScheduler;
}

async function advanceCallToStatus(
  params: AdvanceCallToStatusParams,
): Promise<Call & { twilioSid: string }> {
  const { call, status, result, scheduler } = params;
  switch (call.status) {
    case "NOT_STARTED": {
      throw new Error(
        "Calls can't be updated until they've been queued or initiated.",
      );
    }
    case "QUEUED": {
      if (status === "INITIATED") {
        return await call.advanceStatusToInitiated(params);
      } else if (status === "RINGING") {
        return await call.advanceStatusToRinging(params);
      } else {
        throw new Error(`Invalid transition to ${status}`);
      }
    }
    case "INITIATED": {
      if (status !== "RINGING") {
        throw new Error("Invalid transition");
      }
      return await call.advanceStatusToRinging(params);
    }
    case "RINGING": {
      if (status !== "IN_PROGRESS") {
        throw new Error("Invalid transition");
      }
      const callerId = scheduler.getNextIdleCallerId();
      if (callerId === undefined) {
        throw new Error("TODO(mvp) handle overcalling");
      }
      return call.advanceStatusToInProgress({
        ...params,
        callerId,
      });
    }
    case "IN_PROGRESS": {
      if (status !== "COMPLETED") {
        throw new Error("Invalid transition");
      }
      if (result === undefined) {
        throw new Error("Missing result for completed call");
      }
      return call.advanceStatusToCompleted({
        ...params,
        result,
      });
    }
    case "COMPLETED": {
      throw new Error("Can't update a completed call.");
    }
  }
}

@Injectable()
export class PhoneCanvassService {
  callsBySid = new Map<string, Call & { twilioSid: string }>();
  // From phone canvass id.
  #schedulers = new Map<string, PhoneCanvassScheduler>();
  // Only present if there's an active simulation.
  #simulator: PhoneCanvassSimulator | undefined;

  constructor(
    private readonly entityManager: EntityManager,
    private twilioService: TwilioService,
    private readonly globalState: PhoneCanvassGlobalStateService,
    private readonly schedulerFactory: PhoneCanvassSchedulerFactory,
    private readonly serverMetaService: ServerMetaService,
    @InjectRepository(PhoneCanvassEntity)
    private readonly repo: EntityRepository<PhoneCanvassEntity>,
  ) {}

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

  watchSchedulerForCalls(scheduler: PhoneCanvassScheduler): void {
    scheduler.calls.subscribe({
      complete: () => {
        console.log("TODO(mvp) handle running out of calls.");
      },
      next: (call) => {
        void (async (): Promise<void> => {
          const { sid, timestamp, status } =
            this.#simulator?.phoneCanvassId !== scheduler.phoneCanvassId
              ? await this.twilioService.makeCall(call)
              : simulateMakeCall(call);

          switch (status) {
            case "QUEUED": {
              const queuedCall = await call.advanceStatusToQueued({
                currentTime: timestamp,
                twilioSid: sid,
              });
              this.callsBySid.set(sid, queuedCall);
              break;
            }
            default: {
              throw new Error("Calls can only start as queued.");
            }
          }
        })();
      },
    });
  }

  // Returns the id of the new phone canvass.
  async create(
    canvass: CreatePhoneCanvassRequestDTO,
    creatorEmail: string,
    audioFile?: Express.Multer.File,
  ): Promise<CreatePhoneCanvassResponseDTO> {
    const canvassEntity = this.repo.create({
      name: canvass.name,
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

    await this.#updateSyncData(canvassEntity.id);

    return CreatePhoneCanvassResponseDTO.from({
      id: canvassEntity.id,
    });
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
      { populate: ["contacts.contact"] },
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
      .findOneOrFail(PhoneCanvassContactEntity, { id });
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

  async #updateSyncData(phoneCanvassId: string): Promise<void> {
    // TODO(mvp): consider exposing which caller is talking to which contact.
    const callers: CallerSummary[] = this.globalState
      .listCallers(phoneCanvassId)
      .map((x) => {
        return { displayName: x.displayName, ready: x.ready, callerId: x.id };
      });

    let contacts: ContactSummary[] = (
      await this.getPhoneCanvassContacts(phoneCanvassId)
    ).map((contact) => {
      const dto = contact.toDTO();
      return {
        contactDisplayName: dto.contact.formatName(),
        contactId: contact.contact.id,
        status: contact.callStatus,
        result: contact.callResult,
        // TODO: optimize.
        callerId: [...this.callsBySid.values()].find(
          (x) => x.contactId() === contact.id,
        )?.id,
      };
    });

    contacts = contacts
      .filter((a) => a.status !== "COMPLETED")
      .sort((a, b) => -callStatusSort(a.status, b.status))
      .slice(0, 20);

    const syncData = {
      callers,
      contacts,
      serverInstanceUUID: this.serverMetaService.instanceUUID,
      phoneCanvassId: phoneCanvassId,
    };

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
        entityManager: this.entityManager,
      });
      this.#schedulers.set(phoneCanvassId, scheduler);
    }

    const { started } = scheduler.startIfNeeded();
    if (started) {
      this.watchSchedulerForCalls(scheduler);
    }
    return scheduler;
  }

  async registerCaller(
    caller: CreatePhoneCanvassCallerDTO,
  ): Promise<PhoneCanvassCallerDTO> {
    await this.getPhoneCanvassByIdOrFail(caller.activePhoneCanvassId);
    const newCaller = await this.globalState.registerCaller(
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
    const refreshedCaller = await this.globalState.refreshOrCreateCaller(
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
    await this.globalState.updateOrCreateCaller(
      caller,
      async (id) => await this.twilioService.getAuthToken(id),
    );
    const scheduler = await this.getInitializedScheduler({
      phoneCanvassId: caller.activePhoneCanvassId,
    });
    if (caller.ready) {
      scheduler.addCaller(caller.id);
    } else {
      scheduler.removeCaller(caller.id);
    }

    await this.#updateSyncData(caller.activePhoneCanvassId);
    return caller;
  }

  async updateCall(params: {
    sid: string;
    status: CallStatus;
    result?: CallResult;
    timestamp: number;
  }): Promise<void> {
    const { sid, status, result, timestamp } = params;
    const call = this.callsBySid.get(sid);
    if (call === undefined) {
      console.log(
        "callsBySid",
        [...this.callsBySid.values()].map((x) => x.twilioSid),
      );
      throw new Error(`Unable to update call. sid ${sid} doesn't exist.`);
    }

    const newCallParams = {
      currentTime: timestamp,
      twilioSid: sid,
      status,
      result,
    };

    let newCall: (Call & { twilioSid: string }) | undefined = undefined;

    if (status === "COMPLETED") {
      if (result === undefined) {
        throw new Error("COMPLETED call missing result");
      }
      newCall = await call.advanceStatusToFailed({ ...newCallParams, result });
    }

    if (newCall === undefined) {
      const scheduler = this.#schedulers.get(call.canvassId());
      if (scheduler === undefined) {
        throw new Error("Missing scheduler.");
      }
      newCall = await advanceCallToStatus({
        ...newCallParams,
        scheduler,
        call,
      });
    }
    this.callsBySid.set(sid, newCall);
    await this.#updateSyncData(newCall.canvassId());
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
}
