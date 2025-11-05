import { Injectable, UnauthorizedException } from "@nestjs/common";
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
import { PhoneCanvassScheduler } from "./Scheduler/PhoneCanvassScheduler.js";
import { Call } from "./Scheduler/PhoneCanvassCall.js";
import { mergeMap } from "rxjs";
import { PhoneCanvassSchedulerFactory } from "./Scheduler/PhoneCanvassSchedulerFactory.js";
import { simulateMakeCall } from "./PhoneCanvassSimulator.js";

@Injectable()
export class PhoneCanvassService {
  repo: EntityRepository<PhoneCanvassEntity>;
  callsBySid = new Map<string, Call>();
  // From phone canvass id.
  schedulers = new Map<string, PhoneCanvassScheduler>();
  // Phone canvass ids.
  #inSimulation = new Set<string>();

  constructor(
    private readonly entityManager: EntityManager,
    private twilioService: TwilioService,
    private readonly globalState: PhoneCanvassGlobalStateService,
    private readonly schedulerFactory: PhoneCanvassSchedulerFactory,
  ) {
    this.repo =
      entityManager.getRepository<PhoneCanvassEntity>(PhoneCanvassEntity);
  }

  startSimulating(phoneCanvassId: string): void {
    this.#inSimulation.add(phoneCanvassId);
  }

  watchSchedulerForCalls(scheduler: PhoneCanvassScheduler): void {
    scheduler.calls
      .pipe(
        // mergeMap is the easiest way to run async code per call.
        mergeMap(async (call) => {
          const { sid, timestamp, status } = !this.#inSimulation.has(
            scheduler.phoneCanvassId,
          )
            ? await this.twilioService.makeCall(call)
            : simulateMakeCall(call);

          switch (status) {
            case "QUEUED": {
              const queuedCall = call.advanceStatusToQueued({
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
        }),
      )
      .subscribe({
        complete: () => {
          console.log("TODO(mvp) handle running out of calls.");
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

  async getAuthToken(id: string): Promise<PhoneCanvassAuthTokenResponseDTO> {
    await this.getPhoneCanvassByIdOrFail(id);
    return this.twilioService.getAuthToken();
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
    const contacts = (await this.getPhoneCanvassContacts(phoneCanvassId)).map(
      (x) => {
        return x.toDTO();
      },
    );

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

    const syncData = {
      callers: this.globalState.listCallers(phoneCanvassId).map((x) => {
        return { displayName: x.displayName, ready: x.ready };
      }),
      activeCalls,
      pendingCalls,
    };
    await this.twilioService.setSyncData(phoneCanvassId, syncData);
  }

  async #getInitializedScheduler(params: {
    phoneCanvassId: string;
  }): Promise<PhoneCanvassScheduler> {
    const { phoneCanvassId } = params;
    let scheduler = this.schedulers.get(phoneCanvassId);
    if (scheduler === undefined) {
      const contacts = await this.getPhoneCanvassContacts(phoneCanvassId);
      scheduler = this.schedulerFactory.createScheduler({
        contacts: contacts,
        phoneCanvassId: phoneCanvassId,
      });
      this.schedulers.set(phoneCanvassId, scheduler);
    }

    const { started } = scheduler.startIfNeeded();
    if (started) {
      this.watchSchedulerForCalls(scheduler);
    }
    return scheduler;
  }

  async addCaller(
    caller: CreatePhoneCanvassCallerDTO,
  ): Promise<PhoneCanvassCallerDTO> {
    const newCaller = this.globalState.addCaller(caller);
    await this.#updateSyncData(caller.activePhoneCanvassId);
    return newCaller;
  }

  async updateCaller(
    caller: PhoneCanvassCallerDTO,
  ): Promise<PhoneCanvassCallerDTO> {
    this.globalState.updateCaller(caller);
    const scheduler = await this.#getInitializedScheduler({
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

  updateCall(params: {
    sid: string;
    status: CallStatus;
    result?: CallResult;
    timestamp: number;
  }): void {
    const { sid, status, result, timestamp } = params;
    const call = this.callsBySid.get(sid);
    if (call === undefined) {
      throw new Error(`Unable to update call. sid ${sid} doesn't exist.`);
    }

    const newCallParams = {
      currentTime: timestamp,
      twilioSid: sid,
    };

    let newCall: Call | undefined = undefined;

    switch (call.status) {
      case "NOT_STARTED": {
        throw new Error(
          "Calls can't be updated until they've been queued or initiated.",
        );
      }
      case "QUEUED": {
        if (status !== "INITIATED") {
          throw new Error(`Invalid transition to ${status}`);
        }
        newCall = call.advanceStatusToInitiated(newCallParams);
        break;
      }
      case "INITIATED": {
        if (status !== "RINGING") {
          throw new Error("Invalid transition");
        }
        newCall = call.advanceStatusToRinging(newCallParams);
        break;
      }
      case "RINGING": {
        if (status !== "IN_PROGRESS") {
          throw new Error("Invalid transition");
        }
        const scheduler = this.schedulers.get(call.canvassId());
        if (scheduler === undefined) {
          throw new Error("Missing scheduler.");
        }
        const callerId = scheduler.getNextIdleCallerId();
        if (callerId === undefined) {
          throw new Error("TODO(mvp) handle overcalling");
        }
        newCall = call.advanceStatusToInProgress({
          ...newCallParams,
          callerId,
        });
        break;
      }
      case "IN_PROGRESS": {
        if (status !== "COMPLETED") {
          throw new Error("Invalid transition");
        }
        if (result === undefined) {
          throw new Error("Missing result for completed call");
        }
        newCall = call.advanceStatusToCompleted({
          ...newCallParams,
          result,
        });
        break;
      }
      case "COMPLETED": {
        throw new Error("Can't update a completed call.");
        break;
      }
    }
    this.callsBySid.set(sid, newCall);
  }
}
