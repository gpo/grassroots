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
import { PhoneCanvassScheduler } from "./Scheduler/PhoneCanvassScheduler.js";
import { Call } from "./Scheduler/PhoneCanvassCall.js";
import { mergeMap } from "rxjs";
import { PhoneCanvassSchedulerFactory } from "./Scheduler/PhoneCanvassSchedulerFactory.js";

@Injectable()
export class PhoneCanvassService {
  repo: EntityRepository<PhoneCanvassEntity>;
  callsBySid = new Map<string, Call>();
  // From phone canvass id.
  schedulers = new Map<string, PhoneCanvassScheduler>();

  constructor(
    private readonly entityManager: EntityManager,
    private twilioService: TwilioService,
    private readonly globalState: PhoneCanvassGlobalStateService,
    private readonly schedulerFactory: PhoneCanvassSchedulerFactory,
  ) {
    this.repo =
      entityManager.getRepository<PhoneCanvassEntity>(PhoneCanvassEntity);
  }

  watchSchedulerForCalls(scheduler: PhoneCanvassScheduler): void {
    scheduler.calls
      .pipe(
        // mergeMap is the easiest way to run async code per call.
        mergeMap(async (call) => {
          const { sid, timestamp, status } =
            await this.twilioService.makeCall(call);

          switch (status) {
            case "QUEUED": {
              const queuedCall = call.advanceStatusToQueued({
                currentTime: timestamp,
                twilioSid: sid,
              });
              this.callsBySid.set(sid, queuedCall);
              break;
            }
            case "INITIATED": {
              const initiatedCall = call.advanceStatusToInitiated({
                currentTime: timestamp,
                twilioSid: sid,
              });
              this.callsBySid.set(sid, initiatedCall);
              break;
            }
            default: {
              throw new Error("Calls can only start as queued or initiated.");
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

  async #getInitializedScheduler(params: {
    phoneCanvassId: string;
  }): Promise<PhoneCanvassScheduler> {
    const { phoneCanvassId } = params;
    let scheduler = this.schedulers.get(phoneCanvassId);
    if (scheduler === undefined) {
      const canvass = await this.getPhoneCanvassByIdOrFail(phoneCanvassId);
      scheduler = this.schedulerFactory.createScheduler({
        contacts: canvass.contacts.getItems(),
        phoneCanvassId: canvass.id,
      });
      this.schedulers.set(phoneCanvassId, scheduler);
    }

    void scheduler.startIfNeeded();
    return scheduler;
  }

  async addCaller(
    caller: CreatePhoneCanvassCallerDTO,
  ): Promise<PhoneCanvassCallerDTO> {
    const newCaller = this.globalState.addCaller(caller);
    console.log("ADD PARTICIPANT");
    await this.updateSyncData(caller.activePhoneCanvassId);
    const scheduler = await this.#getInitializedScheduler({
      phoneCanvassId: caller.activePhoneCanvassId,
    });
    scheduler.addCaller(newCaller.id);

    return newCaller;
  }

  async updateCaller(
    caller: PhoneCanvassCallerDTO,
  ): Promise<PhoneCanvassCallerDTO> {
    this.globalState.updateCaller(caller);
    await this.updateSyncData(caller.activePhoneCanvassId);
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

    switch (call.status) {
      case "NOT_STARTED": {
        throw new Error(
          "Calls can't be updated until they've been queued or initiated.",
        );
      }
      case "QUEUED": {
        if (status !== "INITIATED") {
          throw new Error("Invalid transition");
        }
        call.advanceStatusToInitiated(newCallParams);
        break;
      }
      case "INITIATED": {
        if (status !== "RINGING") {
          throw new Error("Invalid transition");
        }
        call.advanceStatusToRinging(newCallParams);
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
        call.advanceStatusToInProgress({ ...newCallParams, callerId });
        break;
      }
      case "IN_PROGRESS": {
        if (status !== "COMPLETED") {
          throw new Error("Invalid transition");
        }
        if (result === undefined) {
          throw new Error("Missing result for completed call");
        }
        call.advanceStatusToCompleted({
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
  }
}
