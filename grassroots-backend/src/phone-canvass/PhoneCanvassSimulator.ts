import { PhoneCanvassService } from "./PhoneCanvass.service.js";
import {
  CreatePhoneCanvassCallerDTO,
  PhoneCanvassCallerDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { Faker, en, en_CA } from "@faker-js/faker";
import { delay } from "grassroots-shared/util/Delay";
import normal from "@stdlib/random-base-normal";
import { fail } from "assert";

const MAX_CALLER_COUNT = 10;
const MAX_SIMULATION_TIME = 10 * 60;

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

function sampleLogNormal(
  sampler: NormalDistributionSampler,
  mu: number,
  sigma: number,
): number {
  const z = sampler(0, 1); // standard normal
  return Math.exp(mu + sigma * z);
}

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

type SimulationEvent = AddCallerEvent | ChangeReadyCallerEvent;

export class PhoneCanvassSimulator {
  #rand: NormalDistributionSampler;
  #faker: Faker;
  #events: SimulationEvent[] = [];
  #callers: PhoneCanvassCallerDTO[] = [];

  constructor(
    private readonly phoneCanvassService: PhoneCanvassService,
    private readonly phoneCanvassId: string,
    private readonly seed?: number,
  ) {
    if (seed !== undefined) {
      this.#rand = normal.factory({
        seed,
      });
    } else {
      this.#rand = normal.factory({});
    }

    this.#faker = new Faker({ seed, locale: [en_CA, en] });
  }

  schedulerCaller(index: number): void {
    let ts = callerJoinDelta(this.#rand);
    this.#events.push({
      kind: "add_caller",
      index,
      ts,
    });

    while (ts < MAX_SIMULATION_TIME) {
      ts += callerReadyDelta(this.#rand);
      this.#events.push({
        kind: "change_ready_caller",
        index,
        ts,
        ready: true,
      });
      ts += callerUnreadyDelta(this.#rand);
      this.#events.push({
        kind: "change_ready_caller",
        index,
        ts,
        ready: false,
      });
    }
  }

  schedulerCallers(): void {
    for (let i = 0; i < MAX_CALLER_COUNT; ++i) {
      this.schedulerCaller(i);
    }
  }

  async start(): Promise<void> {
    // We precompute all events as that will make it easier to
    // reproduce issues with a deterministic random seed.
    this.schedulerCallers();
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
