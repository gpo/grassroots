/* eslint-disable grassroots/entity-use */
import {
  combineLatest,
  debounceTime,
  map,
  Observable,
  scan,
  startWith,
} from "rxjs";
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
  PhoneCanvassContactDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { EntityManager } from "@mikro-orm/core";

async function makeCall(params: {
  call: Call;
  simulator?: PhoneCanvassSimulator;
  twilioService: TwilioService;
}): Promise<void> {
  const { call, simulator, twilioService } = params;
  const { sid, status } =
    simulator?.phoneCanvassId !== call.canvassId
      ? await twilioService.makeCall(call)
      : simulateMakeCall(call);
  call.update(status, { twilioSid: sid });
}

export class PhoneCanvassModel {
  readonly phoneCanvassId: string;
  readonly calls$: Observable<Call>;
  readonly scheduler: PhoneCanvassScheduler;

  #serverMetaService: ServerMetaService;
  #twilioService: TwilioService;
  #contacts: PhoneCanvassContactDTO[];
  // Only present if there's an active simulation.
  #simulator: PhoneCanvassSimulator | undefined;
  #phoneCanvassCallersModel: PhoneCanvassCallersModel;
  #callsBySid = new Map<string, Call>();
  #entityManager: EntityManager;

  constructor(params: {
    phoneCanvassId: string;
    scheduler: PhoneCanvassScheduler;
    calls$: Observable<Call>;
    contacts: PhoneCanvassContactEntity[];
    entityManager: EntityManager;
    twilioService: TwilioService;
    phoneCanvassCallersModel: PhoneCanvassCallersModel;
    serverMetaService: ServerMetaService;
  }) {
    this.phoneCanvassId = params.phoneCanvassId;
    this.scheduler = params.scheduler;
    this.calls$ = params.calls$;

    // Filtering at this stage means that the progress indicator starts at 0% with a lower
    // total number of contacts if you exit and restart a phone canvass that's partway through.
    this.#contacts = params.contacts
      .filter((x) => !x.beenCalled)
      .map((x) => x.toDTO());
    this.#entityManager = params.entityManager;
    this.#twilioService = params.twilioService;
    this.#phoneCanvassCallersModel = params.phoneCanvassCallersModel;
    this.#serverMetaService = params.serverMetaService;

    this.calls$.subscribe((call) => {
      if (call.twilioSid !== undefined) {
        this.#callsBySid.set(call.twilioSid, call);
      }

      runPromise(call.log(), false);
      runPromise(call.updateContactIfNeeded(this.#entityManager), false);

      if (call.status === "COMPLETED" && call.callerId !== undefined) {
        const becameUnready =
          this.#phoneCanvassCallersModel.onCallCompleteForCaller(call.callerId);
        if (becameUnready.becameUnready) {
          this.scheduler.removeCaller(call.callerId);
        }
      }

      if (call.status === "NOT_STARTED") {
        runPromise(
          makeCall({
            call,
            simulator: this.#simulator,
            twilioService: this.#twilioService,
          }),
          false,
        );
      }
    });

    // TODO: the scheduler should just observe callers$.
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

    const callerSummariesById$: Observable<Map<string, CallerSummary>> =
      this.#phoneCanvassCallersModel.callers$.pipe(
        // Keep the most recent update per caller.
        scan((acc, caller) => {
          acc.set(caller.id, {
            displayName: caller.displayName,
            ready: caller.ready,
            callerId: caller.id,
          } satisfies CallerSummary);
          return acc;
        }, new Map<string, CallerSummary>()),
      );

    const callerSummaries$ = callerSummariesById$.pipe(
      map((x) => [...x.values()]),
    );

    const callsByContactId$ = this.calls$.pipe(
      scan((acc, call) => {
        acc.set(call.phoneCanvassContactId, call);
        return acc;
      }, new Map<number, Call>()),
      startWith(new Map<number, Call>()),
    );

    const completedCallCount$ = this.calls$.pipe(
      scan((completed, call) => {
        if (call.status === "COMPLETED") {
          return completed + 1;
        }
        return completed;
      }, 0),
    );

    // Every time the list of calls updates, we go through the list of contacts to update
    // their statuses.
    const contactSummaries$: Observable<ContactSummary[]> =
      callsByContactId$.pipe(
        map((callsByContactId) => {
          return this.#contacts
            .map((contact) => {
              const call = callsByContactId.get(contact.phoneCanvassContactId);
              const status = call?.status ?? "NOT_STARTED";
              const contactSummary = {
                contactDisplayName: contact.contact.formatName(),
                contactId: contact.contact.id,
                status: status,
                callerId: call?.callerId,
              } satisfies ContactSummary;

              return {
                status,
                contactSummary,
              };
            })
            .filter((contact) => contact.status !== "COMPLETED")
            .sort((a, b) => -callStatusSort(a.status, b.status))
            .slice(0, 20)
            .map((contact) => contact.contactSummary);
        }),
      );

    const syncData$ = combineLatest({
      callers: callerSummaries$.pipe(startWith([])),
      contacts: contactSummaries$,
      callsCompleted: completedCallCount$.pipe(startWith(0)),
    });

    syncData$
      .pipe(
        // When there are multiple changes, don't spam updates.
        // Wait until we've seen half a ms with no change.
        debounceTime(0.5),
      )
      .subscribe((syncData) => {
        runPromise(
          this.#twilioService.setSyncData(this.phoneCanvassId, {
            callers: syncData.callers,
            contacts: syncData.contacts,
            serverInstanceUUID: this.#serverMetaService.instanceUUID,
            phoneCanvassId: this.phoneCanvassId,
            totalContacts: this.#contacts.length,
            doneContacts: syncData.callsCompleted,
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
    const newCaller = await this.#phoneCanvassCallersModel.registerCaller({
      caller,
      getAuthToken: async (id) => await this.#twilioService.getAuthToken(id),
    });
    return newCaller;
  }

  async updateOrCreateCaller(
    caller: PhoneCanvassCallerDTO,
  ): Promise<PhoneCanvassCallerDTO> {
    return await this.#phoneCanvassCallersModel.updateOrCreateCaller(
      caller,
      async (id) => await this.#twilioService.getAuthToken(id),
    );
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
