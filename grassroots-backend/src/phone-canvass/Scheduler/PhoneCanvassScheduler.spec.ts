/* eslint-disable grassroots/entity-use */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { PhoneCanvassContactEntity } from "../entities/PhoneCanvassContact.entity.js";
import {
  NotStartedCall,
  resetPhoneCanvasCallIdsForTest,
} from "./PhoneCanvassCall.js";
import { fail } from "assert";
import {
  PhoneCanvassScheduler,
  PhoneCanvassSchedulerImpl,
} from "./PhoneCanvassScheduler.js";

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const FAKE_CONTACTS: PhoneCanvassContactEntity[] = [
  {
    id: 10,
    callStatus: "NOT_STARTED",
  },
  {
    id: 20,
    callStatus: "NOT_STARTED",
  },
  {
    id: 30,
    callStatus: "NOT_STARTED",
  },
] as unknown as PhoneCanvassContactEntity[];

let currentTime = -1;

function getScheduler(): PhoneCanvassScheduler {
  const scheduler = new PhoneCanvassSchedulerImpl(FAKE_CONTACTS);

  const currentTimeMock = vi.fn(() => {
    return currentTime;
  });
  scheduler.getCurrentTime = currentTimeMock;
  return scheduler;
}

describe("PhoneCanvassScheduler", () => {
  beforeEach(() => {
    resetPhoneCanvasCallIdsForTest();
  });
  it("should handle a stream of calls in series", async () => {
    const calls: NotStartedCall[] = [];
    const scheduler = getScheduler();
    scheduler.calls.subscribe((call) => calls.push(call));

    expect(calls).toHaveLength(0);
    void scheduler.start();

    currentTime = 11;
    scheduler.addCaller(1);
    await scheduler.waitForIdleForTest();

    expect(calls).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 1,
        }),
      ]),
    );

    expect(calls[0]?.state.transitionTimestamps.NOT_STARTED).toBe(11);
    expect(calls[0]?.state.transitionTimestamps.INITIATED).toBe(undefined);

    calls.length = 0;

    scheduler.addCaller(2);
    await scheduler.waitForIdleForTest();
    expect(calls).toStrictEqual([
      expect.objectContaining({
        id: 2,
      }),
    ]);
    calls.length = 0;

    scheduler.addCaller(3);
    await scheduler.waitForIdleForTest();
    expect(calls).toStrictEqual([
      expect.objectContaining({
        id: 3,
      }),
    ]);
    calls.length = 0;

    scheduler.addCaller(4);
    await scheduler.waitForIdleForTest();
    // There's no contact to call.
    expect(calls).toHaveLength(0);
    scheduler.stop();
  });

  it("should handle call updates", async () => {
    const scheduler = getScheduler();
    const CALLER_ID = 101;
    currentTime = 1;

    const calls: NotStartedCall[] = [];
    scheduler.calls.subscribe((call) => calls.push(call));

    void scheduler.start();
    scheduler.addCaller(CALLER_ID);
    await scheduler.waitForIdleForTest();

    expect(calls).toStrictEqual([
      expect.objectContaining({
        id: 1,
      }),
    ]);
    const call = calls[0] ?? fail();
    expect(call.id).toBe(1);

    const callInProgress = call
      .advanceStatusToQueued({ currentTime: 2 })
      .advanceStatusToInitiated({
        currentTime: 3,
      })
      .advanceStatusToRinging({
        currentTime: 4,
      })
      .advanceStatusToInProgress({
        callerId:
          scheduler.getNextIdleCallerId() ?? fail("Missing next caller id"),
        currentTime: 5,
      });

    await scheduler.waitForIdleForTest();
    expect(calls).toHaveLength(1);

    const completedCall = callInProgress.advanceStatusToCompleted({
      currentTime: 6,
      result: "COMPLETED",
    });

    await scheduler.waitForIdleForTest();
    expect(calls).toHaveLength(2);

    expect(completedCall.state.transitionTimestamps).toStrictEqual({
      NOT_STARTED: 1,
      QUEUED: 2,
      INITIATED: 3,
      RINGING: 4,
      IN_PROGRESS: 5,
      COMPLETED: 6,
    });
    expect(completedCall.callerId).toBe(CALLER_ID);
    scheduler.stop();
  });
});
