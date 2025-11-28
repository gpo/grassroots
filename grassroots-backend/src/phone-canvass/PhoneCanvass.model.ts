/* eslint-disable grassroots/entity-use */
import { combineLatest, map, Observable, scan } from "rxjs";
import { Call } from "./Scheduler/PhoneCanvassCall.js";
import { PhoneCanvassScheduler } from "./Scheduler/PhoneCanvassScheduler.js";
import { TwilioService } from "./Twilio.service.js";
import {
  PhoneCanvassSimulator,
  simulateMakeCall,
} from "./PhoneCanvassSimulator.js";
import { callStatusSort } from "grassroots-shared/dtos/PhoneCanvass/CallStatus.dto";
import {
  CallerSummary,
  ContactSummary,
} from "grassroots-shared/PhoneCanvass/PhoneCanvassSyncData";
import { runPromise } from "grassroots-shared/util/RunPromise";
import { PhoneCanvassCallersModel } from "./PhoneCanvassCallers.model.js";
import { PhoneCanvassContactEntity } from "./entities/PhoneCanvassContact.entity.js";
import { ServerMetaService } from "../server-meta/ServerMeta.service.js";
import { getEnvVars } from "../GetEnvVars.js";
import { ForbiddenException } from "@nestjs/common";
import {
  CreatePhoneCanvassCallerDTO,
  PhoneCanvassCallerDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";

export class PhoneCanvassModel {
  readonly phoneCanvassId: string;
  readonly calls$: Observable<Call>;
  readonly scheduler: PhoneCanvassScheduler;

  #serverMetaService: ServerMetaService;
  #twilioService: TwilioService;
  #contacts: PhoneCanvassContactEntity[];
  // Only present if there's an active simulation.
  #simulator: PhoneCanvassSimulator | undefined;
  #phoneCanvassCallersModel: PhoneCanvassCallersModel;
  #callsBySid = new Map<string, Call>();

  constructor(params: {
    phoneCanvassId: string;
    scheduler: PhoneCanvassScheduler;
    calls$: Observable<Call>;
    contacts: PhoneCanvassContactEntity[];
    twilioService: TwilioService;
    phoneCanvassCallersModel: PhoneCanvassCallersModel;
    serverMetaService: ServerMetaService;
  }) {
    this.phoneCanvassId = params.phoneCanvassId;
    this.scheduler = params.scheduler;
    this.calls$ = params.calls$;
    // Filtering at this stage means that the progress indicator starts at 0% if you exit
    // and restart a phone canvass that's partway through.
    this.#contacts = params.contacts.filter((x) => !x.beenCalled);
    this.#twilioService = params.twilioService;
    this.#phoneCanvassCallersModel = params.phoneCanvassCallersModel;
    this.#serverMetaService = params.serverMetaService;

    this.calls$.subscribe((call) => {
      if (call.twilioSid !== undefined) {
        this.#callsBySid.set(call.twilioSid, call);
      }

      // TODO(mvp), handle call complete for caller, update database, etc.
      if (call.status === "NOT_STARTED") {
        runPromise(
          (async (): Promise<void> => {
            const { sid, status } =
              this.#simulator?.phoneCanvassId !== call.canvassId
                ? await this.#twilioService.makeCall(call)
                : simulateMakeCall(call);
            call.update(status, { twilioSid: sid });
          })(),
          false,
        );
      }
    });

    // Add and remove callers from the scheduler.
    this.#phoneCanvassCallersModel.callers$.subscribe((caller) => {
      switch (caller.ready) {
        case "ready": {
          this.scheduler.addCaller(caller.id);
          break;
        }
        case "unready": {
          this.scheduler.removeCaller(caller.id);
          break;
        }
        case "last call": {
          // We handle this when a call completes.
        }
      }
    });

    const callerSummariesById$: Observable<Map<number, CallerSummary>> =
      this.#phoneCanvassCallersModel.callers$.pipe(
        // Keep the most recent update per caller.
        scan((acc, caller) => {
          acc.set(caller.id, {
            displayName: caller.displayName,
            ready: caller.ready,
            callerId: caller.id,
          } satisfies CallerSummary);
          return acc;
        }, new Map<number, CallerSummary>()),
      );

    const callerSummaries$ = callerSummariesById$.pipe(
      map((x) => [...x.values()]),
    );

    const callsByCallerId$ = this.calls$.pipe(
      scan((acc, call) => {
        if (call.callerId !== undefined) {
          acc.set(call.callerId, call);
        }
        return acc;
      }, new Map<number, Call>()),
    );

    const completedCallCount$ = this.calls$.pipe(
      scan((completed, call) => {
        if (call.status === "COMPLETED") {
          return completed + 1;
        }
        return completed;
      }, 0),
    );

    // Every time the list of calls updates, we go through the list of contacts.
    const contactSummaries$: Observable<ContactSummary[]> =
      callsByCallerId$.pipe(
        map((callsByCallerId) => {
          return this.#contacts
            .map((contact) => {
              const call = callsByCallerId.get(contact.id);
              const status = call?.status ?? "NOT_STARTED";
              const contactDTO = contact.toDTO();
              const contactSummary = {
                contactDisplayName: contactDTO.contact.formatName(),
                contactId: contactDTO.contact.id,
                status: status,
                callerId: call?.callerId,
              } satisfies ContactSummary;

              return {
                status,
                contactSummary,
              };
            })
            .filter((contact) => contact.status !== "NOT_STARTED")
            .sort((a, b) => -callStatusSort(a.status, b.status))
            .slice(0, 20)
            .map((contact) => contact.contactSummary);
        }),
      );

    const syncData$ = combineLatest({
      callers: callerSummaries$,
      contacts: contactSummaries$,
      callsCompleted: completedCallCount$,
    });

    syncData$.subscribe((syncData) => {
      runPromise(
        this.#twilioService.setSyncData(this.phoneCanvassId, {
          callers: syncData.callers,
          contacts: syncData.contacts,
          serverInstanceUUID: this.#serverMetaService.instanceUUID,
          phoneCanvassId: this.phoneCanvassId,
          totalContacts: this.#contacts.length,
          doneContacts: this.#contacts.length - syncData.callsCompleted,
        }),
        false,
      );
    });
  }

  async startSimulating(): Promise<void> {
    if (!(await getEnvVars()).ENABLE_PHONE_CANVASS_SIMULATION) {
      throw new ForbiddenException(
        "Can't simulate a phone canvass without ENABLE_PHONE_CANVASS_SIMULATION",
      );
    }

    this.#simulator?.stop();

    this.#simulator = new PhoneCanvassSimulator(this, this.phoneCanvassId);
    await this.#simulator.start();
  }

  async registerCaller(
    caller: CreatePhoneCanvassCallerDTO,
  ): Promise<PhoneCanvassCallerDTO> {
    const newCaller = await this.#phoneCanvassCallersModel.registerCaller(
      caller,
      async (id) => await this.#twilioService.getAuthToken(id),
    );
    return newCaller;
  }

  async refreshOrCreateCaller(
    caller: PhoneCanvassCallerDTO,
  ): Promise<PhoneCanvassCallerDTO> {
    const refreshedCaller =
      await this.#phoneCanvassCallersModel.refreshOrCreateCaller(
        caller,
        async (id) => await this.#twilioService.getAuthToken(id),
      );
    return refreshedCaller;
  }

  async updateOrCreateCaller(
    caller: PhoneCanvassCallerDTO,
  ): Promise<PhoneCanvassCallerDTO> {
    await this.#phoneCanvassCallersModel.updateOrCreateCaller(
      caller,
      async (id) => await this.#twilioService.getAuthToken(id),
    );
    return caller;
  }

  getCallBySid(sid: string): Call {
    const call = this.#callsBySid.get(sid);
    if (call === undefined) {
      throw new Error(`Unable to get call. sid ${sid} doesn't exist.`);
    }
    return call;
  }

  mockCurrentTime(getTime: () => number): void {
    this.scheduler.mockCurrentTime(getTime);
  }
}
