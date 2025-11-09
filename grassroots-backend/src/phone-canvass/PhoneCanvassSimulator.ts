import { PhoneCanvassService } from "./PhoneCanvass.service.js";
import {
  CreatePhoneCanvassCallerDTO,
  PhoneCanvassCallerDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { Faker, en, en_CA } from "@faker-js/faker";
import { delay } from "grassroots-shared/util/Delay";
import normal from "@stdlib/random-base-normal";
import { fail } from "assert";
import {
  CallResult,
  CallResults,
  CallStatus,
} from "grassroots-shared/dtos/PhoneCanvass/CallStatus.dto";
import { Call, NotStartedCall } from "./Scheduler/PhoneCanvassCall.js";
import { PhoneCanvassScheduler } from "./Scheduler/PhoneCanvassScheduler.js";
import { concatMap, Subject } from "rxjs";

const MAX_CALLER_COUNT = 10;

// These deltas are in seconds.
function callerJoinDelta(): number {
  return sampleLogNormal(4, 4);
}
function callerReadyDelta(): number {
  return sampleLogNormal(2, 1);
}
function callerUnreadyDelta(): number {
  return sampleLogNormal(10, 3);
}

// Log normal distribution, with a possibility of failing.
function modelStateTransition(mu: number, sigma: number): number | undefined {
  // 3% chance of failure.
  if (Math.random() < 0.03) {
    return undefined;
  }
  return sampleLogNormal(mu, sigma);
}

function callInitiatedDelta(): number | undefined {
  return modelStateTransition(0.5, 1);
}

function callRingingDelta(): number | undefined {
  return modelStateTransition(0.5, 1);
}

function callInProgressDelta(): number | undefined {
  return modelStateTransition(5, 3);
}

function callCompletedDelta(): number | undefined {
  return modelStateTransition(10, 30);
}

function callFailedDelta(): number {
  return sampleLogNormal(5, 30);
}

function sampleLogNormal(mu: number, sigma: number): number {
  const z = normal(0, 1);
  return Math.exp(mu + sigma * z);
}

const FailingCallResults = CallResults.filter((x) => x !== "COMPLETED");

interface BaseEvent {
  ts: number;
}

interface AddCallerEvent extends BaseEvent {
  kind: "add_caller";
  index: number;
}

interface ChangeReadyCallerEvent extends BaseEvent {
  kind: "change_ready_caller";
  index: number;
  ready: boolean;
}

interface StatusChangeEvent extends BaseEvent {
  kind: "status_change";
  sid: string;
  status: CallStatus;
  result?: CallResult;
}

type SimulationEvent =
  | AddCallerEvent
  | ChangeReadyCallerEvent
  | StatusChangeEvent;

// This doesn't follow the format of real twilio call sids, but is good enough for the simulation.
function getFakeCallSid(call: Call): string {
  return String(call.state.id);
}

export function simulateMakeCall(call: NotStartedCall): {
  sid: string;
  status: CallStatus;
  timestamp: number;
} {
  return {
    sid: getFakeCallSid(call),
    status: "QUEUED",
    timestamp:
      // Use a fixed offset from the NOT_STARTED timestamp.
      // This is the easiest way to ensure it's determinimistic.
      (call.state.transitionTimestamps.NOT_STARTED ??
        fail("Can't reuse NOT_STARTED timestamp, as it isn't present")) + 5,
  };
}

export class PhoneCanvassSimulator {
  #faker: Faker;
  #events = new Subject<SimulationEvent>();
  #callers: PhoneCanvassCallerDTO[] = [];
  static #id = 0;
  readonly id: number;

  constructor(
    private readonly phoneCanvassService: PhoneCanvassService,
    private readonly phoneCanvassId: string,
    private readonly scheduler: PhoneCanvassScheduler,
  ) {
    this.#faker = new Faker({ locale: [en_CA, en] });
    this.id = PhoneCanvassSimulator.#id++;
  }

  async simulateCaller(index: number): Promise<void> {
    await delay(callerJoinDelta());
    this.#events.next({
      kind: "add_caller",
      index,
      ts: Date.now(),
    });

    while (true) {
      await delay(callerReadyDelta());
      this.#events.next({
        kind: "change_ready_caller",
        index,
        ts: Date.now(),
        ready: true,
      });
      await delay(callerUnreadyDelta());
      this.#events.next({
        kind: "change_ready_caller",
        index,
        ts: Date.now(),
        ready: false,
      });
    }
  }

  simulateCallers(): void {
    for (let i = 0; i < MAX_CALLER_COUNT; ++i) {
      void this.simulateCaller(i);
    }
  }

  async #advanceStatusOrFail(params: {
    call: Call;
    status: CallStatus;
    result?: CallResult;
    delayOrFailed: number | undefined;
  }): Promise<void> {
    const { call, status, result, delayOrFailed } = params;
    if (delayOrFailed === undefined) {
      throw new Error("Simulation modelling call failure");
    }
    await delay(delayOrFailed);
    this.#events.next({
      kind: "status_change",
      ts: Date.now(),
      sid: getFakeCallSid(call),
      status,
      result,
    });
  }

  simulateCalls(): void {
    this.scheduler.calls.subscribe((call) => {
      console.log("ON CALL");
      (async (): Promise<void> => {
        console.log("TRYING");
        try {
          // We always delay some amount, so this is guaranteed to take place after "simulateMakeCall"
          // occurs for this call.
          await this.#advanceStatusOrFail({
            call,
            status: "INITIATED",
            delayOrFailed: callInitiatedDelta(),
          });
          await this.#advanceStatusOrFail({
            call,
            status: "RINGING",
            delayOrFailed: callRingingDelta(),
          });
          await this.#advanceStatusOrFail({
            call,
            status: "IN_PROGRESS",
            delayOrFailed: callInProgressDelta(),
          });
          await this.#advanceStatusOrFail({
            call,
            status: "COMPLETED",
            result: "COMPLETED",
            delayOrFailed: callCompletedDelta(),
          });
        } catch (e) {
          console.log("FAILURE");
          void e;
          await delay(callFailedDelta());
          const result =
            FailingCallResults[
              Math.floor(Math.random() * FailingCallResults.length)
            ];
          this.#events.next({
            kind: "status_change",
            ts: Date.now(),
            sid: getFakeCallSid(call),
            status: "COMPLETED",
            result,
          });
        }
      })().catch((e: unknown) => {
        throw new Error(String(e));
      });
    });
  }

  start(): void {
    this.simulateCalls();
    this.simulateCallers();

    this.#events
      .pipe(
        concatMap(async (event: SimulationEvent) => {
          console.log("EVENT:", event);
          switch (event.kind) {
            case "add_caller": {
              this.#callers[event.index] =
                await this.phoneCanvassService.registerCaller(
                  CreatePhoneCanvassCallerDTO.from({
                    displayName: this.#faker.person.fullName(),
                    email: this.#faker.internet.email(),
                    activePhoneCanvassId: this.phoneCanvassId,
                  }),
                );
              break;
            }
            case "change_ready_caller": {
              const caller =
                this.#callers[event.index] ??
                fail(
                  `Can't update caller that doesn't exist. Simulator id: ${String(this.id)}`,
                );
              caller.ready = event.ready;
              await this.phoneCanvassService.updateCaller(caller);
              break;
            }
            case "status_change": {
              await this.phoneCanvassService.updateCall({
                ...event,
                timestamp: event.ts,
              });
              break;
            }
            default: {
              const _exhaustiveCheck: never = event;
              void _exhaustiveCheck;
            }
          }
        }),
      )
      .subscribe();
  }
}
