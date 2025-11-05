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
import { NotStartedCall } from "./Scheduler/PhoneCanvassCall.js";
import { PhoneCanvassScheduler } from "./Scheduler/PhoneCanvassScheduler.js";
import { mergeMap, Observable, Subject } from "rxjs";

const MAX_CALLER_COUNT = 10;

type NormalDistributionSampler = (mean: number, sigma: number) => number;
// These deltas are in seconds.
function callerJoinDelta(sampler: NormalDistributionSampler): number {
  return sampleLogNormal(sampler, 4, 4);
}
function callerReadyDelta(sampler: NormalDistributionSampler): number {
  return sampleLogNormal(sampler, 2, 1);
}
function callerUnreadyDelta(sampler: NormalDistributionSampler): number {
  return sampleLogNormal(sampler, 10, 3);
}

// Log normal distribution, with a possibility of failing.
function modelStateTransition(
  sampler: NormalDistributionSampler,
  mu: number,
  sigma: number,
): number | undefined {
  // 3% chance of failure.
  if (Math.random() > 0.03) {
    return undefined;
  }
  const value = sampleLogNormal(sampler, mu, sigma);

  return value;
}

function callInitiatedDelta(
  sampler: NormalDistributionSampler,
): number | undefined {
  return modelStateTransition(sampler, 0.5, 1);
}

function callRingingDelta(
  sampler: NormalDistributionSampler,
): number | undefined {
  return modelStateTransition(sampler, 0.5, 1);
}

function callInProgressDelta(
  sampler: NormalDistributionSampler,
): number | undefined {
  return modelStateTransition(sampler, 5, 3);
}

function callCompletedDelta(
  sampler: NormalDistributionSampler,
): number | undefined {
  return modelStateTransition(sampler, 10, 30);
}

function callFailedDelta(sampler: NormalDistributionSampler): number {
  return sampleLogNormal(sampler, 5, 30);
}

function sampleLogNormal(
  sampler: NormalDistributionSampler,
  mu: number,
  sigma: number,
): number {
  const z = sampler(0, 1); // standard normal
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
}

type SimulationEvent =
  | AddCallerEvent
  | ChangeReadyCallerEvent
  | StatusChangeEvent;

export function simulateMakeCall(call: NotStartedCall): {
  sid: string;
  status: CallStatus;
  timestamp: number;
} {
  return {
    // This doesn't follow the format of real twilio call sids, but is good enough for the simulation.
    sid: String(call.state.id),
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
  #scheduler: PhoneCanvassScheduler;

  constructor(
    private readonly phoneCanvassService: PhoneCanvassService,
    private readonly phoneCanvassId: string,
  ) {
    this.#faker = new Faker({ locale: [en_CA, en] });
    this.#scheduler =
      this.phoneCanvassService.schedulers.get(phoneCanvassId) ??
      fail("Couldn't find phone canvass scheduler");
  }

  async simulateCaller(index: number): Promise<void> {
    await delay(callerJoinDelta(this.#rand));
    this.#events.next({
      kind: "add_caller",
      index,
      ts: Date.now(),
    });

    while (true) {
      await delay(callerReadyDelta(this.#rand));
      this.#events.next({
        kind: "change_ready_caller",
        index,
        ts: Date.now(),
        ready: true,
      });
      await delay(callerUnreadyDelta(this.#rand));
      this.#events.next({
        kind: "change_ready_caller",
        index,
        ts: Date.now(),
        ready: false,
      });
    }
  }

  async simulateCallers(): Promise<void> {
    for (let i = 0; i < MAX_CALLER_COUNT; ++i) {
      await this.simulateCaller(i);
    }
  }

  async #advanceStatusOrFail(
    status: CallStatus,
    delayTsOrFailed: number | undefined,
  ) {
    if (delayTsOrFailed === undefined) {
      throw new Error("Simulation modelling call failure");
    }
    await delay(delayTsOrFailed);
    this.#events.next({
      kind: "status_change",
      ts: Date.now(),
    });
  }

  scheduleCalls(): Promise<void> {
    this.#scheduler.calls.pipe(
      mergeMap(async (call) => {
        try {
          await this.#advanceStatusOrFail(
            "INITIATED",
            callInitiatedDelta(this.#rand),
          );
          await this.#advanceStatusOrFail(
            "RINGING",
            callRingingDelta(this.#rand),
          );
          await this.#advanceStatusOrFail(
            "IN_PROGRESS",
            callInProgressDelta(this.#rand),
          );
          await this.#advanceStatusOrFail(
            "COMPLETED",
            callCompletedDelta(this.#rand),
          );
        } catch (e) {
          void e;
          await delay(callFailedDelta(this.#rand));
        }
      }),
    );
    /*while (true) {
      const INITIATED = callInitiatedDelta(this.#rand);
      const RINGING = addMaybes(INITIATED, callRingingDelta(this.#rand));
      const IN_PROGRESS = addMaybes(RINGING, callInProgressDelta(this.#rand));
      const PRE_COMPLETION_DELTA = Math.max(
        ...[0, INITIATED, RINGING, IN_PROGRESS].filter((x) => x !== undefined),
      );
      const COMPLETED = addMaybes(
        PRE_COMPLETION_DELTA,
        callCompletedDelta(this.#rand),
      );

      if (COMPLETED !== undefined) {
        this.#callSchedules.push({
          INITIATED,
          RINGING,
          IN_PROGRESS,
          COMPLETED,
          result: "COMPLETED",
        });
      } else {
        const result =
          FailingCallResults[
            Math.floor(Math.random() * FailingCallResults.length)
          ];
        if (result === undefined) {
          throw new Error("Indexing logic error.");
        }

        this.#callSchedules.push({
          INITIATED,
          RINGING,
          IN_PROGRESS,
          COMPLETED: callFailedDelta(this.#rand),
          result,
        });
      }
    }*/
  }

  async start(): Promise<void> {
    this.schedulerCallers();
    this.scheduleCalls();
    this.#events.sort((a, b) => a.ts - b.ts);

    let lastTime = performance.now();
    for (const event of this.#events) {
      await delay((event.ts - lastTime) * 1000);
      lastTime = event.ts;
      switch (event.kind) {
        case "add_caller": {
          this.#callers[event.index] = await this.phoneCanvassService.addCaller(
            CreatePhoneCanvassCallerDTO.from({
              displayName: this.#faker.person.fullName(),
              email: this.#faker.internet.email(),
              activePhoneCanvassId: this.phoneCanvassId,
            }),
          );
          break;
        }
        case "change_ready_caller":
          {
            const caller =
              this.#callers[event.index] ??
              fail("Can't update caller that doesn't exist.");
            caller.ready = event.ready;
            await this.phoneCanvassService.updateCaller(caller);
          }
          break;
        default:
          throw new Error("Unhandled simulation event.");
      }
    }
  }
}
