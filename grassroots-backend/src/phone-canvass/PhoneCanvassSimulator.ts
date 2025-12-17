import {
  CallReadyStatus,
  CreateOrUpdatePhoneCanvassCallerDTO,
  PhoneCanvassCallerDTO,
  PhoneCanvasTwilioCallAnsweredCallbackDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { Faker, en, en_CA } from "@faker-js/faker";
import { delay } from "grassroots-shared/util/Delay";
import { fail } from "assert";
import {
  CallResult,
  CallResults,
  CallStatus,
} from "grassroots-shared/dtos/PhoneCanvass/CallStatus.dto";
import { Call } from "./Scheduler/PhoneCanvassCall.js";
import { concatMap, filter, Subject, Subscription } from "rxjs";
import { runPromise } from "grassroots-shared/util/RunPromise";
import { getEnvVars } from "../GetEnvVars.js";
import { PhoneCanvassModel } from "./PhoneCanvass.model.js";

const MAX_CALLER_COUNT = 4;

// These deltas are in ms.
function callerJoinDelta(): number {
  return sampleLogNormalFromCI(100, 5000);
}
function callerReadyDelta(): number {
  return sampleLogNormalFromCI(1000, 10_000);
}
// Used when we want to model callers becoming unready.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function callerUnreadyDelta(): number {
  return sampleLogNormalFromCI(20_000, 100_000);
}

// Number within range, with a possibility of failing.
function modelStateTransition(
  lower: number,
  upper: number,
): number | undefined {
  // 3% chance of failure.
  if (Math.random() < 0.03) {
    return undefined;
  }
  return sampleLogNormalFromCI(lower, upper);
}

function callInitiatedDelta(): number | undefined {
  return modelStateTransition(0, 1_000);
}

function callRingingDelta(): number | undefined {
  return modelStateTransition(100, 2_000);
}

function callInProgressDelta(): number | undefined {
  return modelStateTransition(2_000, 5_000);
}

function callCompletedDelta(): number | undefined {
  return modelStateTransition(5_000, 30_000);
}

function machineDetectionDoneDelta(): number | undefined {
  return modelStateTransition(500, 1_000);
}

function callFailedDelta(): number {
  return sampleLogNormalFromCI(0, 15_000);
}

// TODO: use a log normal distribution, which is both more realistic, and will
// hit more edge cases. We'll want some hard max to avoid very rare numeric overflow
// though.
function sampleLogNormalFromCI(lower: number, upper: number): number {
  return Math.random() * (upper - lower) + lower;
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
  ready: CallReadyStatus;
}

interface StatusChangeEvent extends BaseEvent {
  kind: "status_change";
  sid: string;
  status: CallStatus;
  result?: CallResult;
}

interface AMDCompleteEvent extends BaseEvent {
  kind: "amd_complete";
  callback: PhoneCanvasTwilioCallAnsweredCallbackDTO;
}

type SimulationEvent =
  | AddCallerEvent
  | ChangeReadyCallerEvent
  | StatusChangeEvent
  | AMDCompleteEvent;

// This doesn't follow the format of real twilio call sids, but is good enough for the simulation.
function getFakeCallSid(call: Call): string {
  return String(call.state.id);
}

export function simulateMakeCall(call: Call): {
  sid: string;
  status: CallStatus;
} {
  return {
    sid: getFakeCallSid(call),
    status: "QUEUED",
  };
}

export class PhoneCanvassSimulator {
  #faker: Faker;
  #events = new Subject<SimulationEvent>();
  #callers: PhoneCanvassCallerDTO[] = [];
  #subscriptions: Subscription[] = [];

  constructor(
    private readonly phoneCanvassModel: PhoneCanvassModel,
    readonly phoneCanvassId: string,
  ) {
    this.#faker = new Faker({ locale: [en_CA, en] });
  }

  async simulateCaller(index: number): Promise<void> {
    await delay(callerJoinDelta());
    this.#events.next({
      kind: "add_caller",
      index,
      ts: Date.now(),
    });

    await delay(callerReadyDelta());
    this.#events.next({
      kind: "change_ready_caller",
      index,
      ts: Date.now(),
      ready: "ready",
    });

    /*while (this.#running) {
      await delay(callerReadyDelta());
      this.#events.next({
        kind: "change_ready_caller",
        index,
        ts: Date.now(),
        ready: "ready",
      });
      await delay(callerUnreadyDelta());
      this.#events.next({
        kind: "change_ready_caller",
        index,
        ts: Date.now(),
        ready: "unready",
      });
    }*/
  }

  simulateCallers(debug: boolean): void {
    for (let i = 0; i < MAX_CALLER_COUNT; ++i) {
      runPromise(this.simulateCaller(i), debug);
    }
  }

  async #advanceStatus(params: {
    call: Call;
    status: CallStatus;
    result?: CallResult;
    delayMs: number;
  }): Promise<void> {
    const { call, status, result, delayMs } = params;
    await delay(delayMs);
    this.#events.next({
      kind: "status_change",
      ts: Date.now(),
      sid: getFakeCallSid(call),
      status,
      result,
    });
  }

  async #advanceCallThroughToCompletion(
    call: Call,
  ): Promise<{ succeeded: boolean }> {
    let delayMs = callInitiatedDelta();
    if (delayMs === undefined) {
      return { succeeded: false };
    }

    await this.#advanceStatus({
      call,
      status: "INITIATED",
      delayMs,
    });
    delayMs = callRingingDelta();
    if (delayMs === undefined) {
      return { succeeded: false };
    }

    await this.#advanceStatus({
      call,
      status: "RINGING",
      delayMs,
    });
    delayMs = callInProgressDelta();
    if (delayMs === undefined) {
      return { succeeded: false };
    }

    await this.#advanceStatus({
      call,
      status: "IN_PROGRESS",
      delayMs,
    });
    delayMs = machineDetectionDoneDelta();
    if (delayMs === undefined) {
      return { succeeded: false };
    }

    if (call.twilioSid === undefined) {
      throw new Error("MISSING SID");
    }

    this.#events.next({
      kind: "amd_complete",
      ts: Date.now(),
      callback: PhoneCanvasTwilioCallAnsweredCallbackDTO.from({
        CallSid: call.twilioSid,
        AnsweredBy: "human",
        MachineDetectionDuration: 1000,
      }),
    });

    /*
    answeredBy:
      | "machine_end_beep"
      | "machine_end_silence"
      | "machine_end_other"
      | "human"
      | "fax"
      | "unknown";
    callerId: string;*/

    delayMs = callCompletedDelta();
    if (delayMs === undefined) {
      return { succeeded: false };
    }

    await this.#advanceStatus({
      call,
      status: "COMPLETED",
      result: "COMPLETED",
      delayMs,
    });
    return { succeeded: true };
  }

  simulateCalls(debug: boolean): void {
    const simulateCallsSubscription = this.phoneCanvassModel.calls$
      // The model moves calls from NOT_STARTED TO QUEUED.
      .pipe(filter((call) => call.status === "QUEUED"))
      .subscribe({
        next: (call) => {
          runPromise(
            (async (): Promise<void> => {
              const result = await this.#advanceCallThroughToCompletion(call);
              if (!result.succeeded) {
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
            })(),
            debug,
          );
        },
        error: (error: unknown) => {
          throw error;
        },
      });
    this.#subscriptions.push(simulateCallsSubscription);
  }

  async start(): Promise<void> {
    const debug = (await getEnvVars()).IS_DEBUG === "true";
    this.simulateCalls(debug);
    this.simulateCallers(debug);

    const eventsSubscription = this.#events
      .pipe(
        concatMap(async (event: SimulationEvent) => {
          switch (event.kind) {
            case "add_caller": {
              this.#callers[event.index] =
                await this.phoneCanvassModel.registerCaller(
                  CreateOrUpdatePhoneCanvassCallerDTO.from({
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
                fail(`Can't update caller that doesn't exist.`);
              caller.ready = event.ready;
              await this.phoneCanvassModel.updateOrCreateCaller(
                caller.toUpdate(),
              );
              break;
            }
            case "status_change": {
              const call = this.phoneCanvassModel.getCallBySid(event.sid);
              call.update(event.status, event);
              break;
            }
            case "amd_complete": {
              const call = this.phoneCanvassModel.getCallBySid(
                event.callback.CallSid,
              );
              if (call.twilioSid === undefined) {
                throw new Error("Call must have sid by now");
              }

              this.phoneCanvassModel.twilioCallAnsweredCallback(
                PhoneCanvasTwilioCallAnsweredCallbackDTO.from({
                  CallSid: call.twilioSid,
                  AnsweredBy: "human",
                  MachineDetectionDuration: 1000,
                }),
                call,
              );
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
    this.#subscriptions.push(eventsSubscription);
  }

  stop(): void {
    for (const subscription of this.#subscriptions) {
      subscription.unsubscribe();
    }
  }
}
