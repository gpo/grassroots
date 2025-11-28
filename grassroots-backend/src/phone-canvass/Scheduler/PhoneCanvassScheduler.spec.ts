/* eslint-disable grassroots/entity-use */

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { PhoneCanvassContactEntity } from "../entities/PhoneCanvassContact.entity.js";
import { Call, resetPhoneCanvasCallIdsForTest } from "./PhoneCanvassCall.js";
import { fail } from "assert";
import { PhoneCanvassModule } from "../PhoneCanvass.module.js";
import { PhoneCanvassModelFactory } from "./PhoneCanvassModelFactory.js";
import { PhoneCanvassModel } from "../PhoneCanvass.model.js";
import { TwilioServiceMock } from "../Twilio.service.mock.js";
import { ServerMetaService } from "../../server-meta/ServerMeta.service.js";
import { TwilioService } from "../Twilio.service.js";

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const FAKE_CONTACTS: PhoneCanvassContactEntity[] = [
  {
    id: 10,
    callStatus: "NOT_STARTED",
    contact: { contact: { id: 0 } },
  },
  {
    id: 20,
    callStatus: "NOT_STARTED",
    contact: { contact: { id: 1 } },
  },
  {
    id: 30,
    callStatus: "NOT_STARTED",
    contact: { contact: { id: 2 } },
  },
] as unknown as PhoneCanvassContactEntity[];

let currentTime = -1;

function getModel(): PhoneCanvassModel {
  const factory = new PhoneCanvassModelFactory();
  const model = factory.createModel({
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    twilioService: new TwilioServiceMock() as unknown as TwilioService,
    phoneCanvassId: "fake phone canvass id",
    contacts: FAKE_CONTACTS,
    serverMetaService: new ServerMetaService(),
  });

  const currentTimeMock = vi.fn(() => {
    return currentTime;
  });

  model.mockCurrentTime(currentTimeMock);
  return model;
}

describe("PhoneCanvassScheduler", () => {
  beforeAll(async () => {
    await new PhoneCanvassModule().onModuleInit();
  });
  beforeEach(() => {
    resetPhoneCanvasCallIdsForTest();
  });
  it.only("should handle a stream of calls in series", async () => {
    console.log("START OF TEST");
    const calls: Call[] = [];
    const model = getModel();
    const scheduler = model.scheduler;
    model.calls$.subscribe((call) => calls.push(call));

    expect(calls).toHaveLength(0);

    currentTime = 11;
    scheduler.addCaller(1);
    console.log("BEFORE IDLE WAIT");
    await scheduler.waitForIdleForTest();
    console.log("AFTER IDLE WAIT");

    expect(calls).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 1,
        }),
      ]),
    );

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
    const model = getModel();
    const scheduler = model.scheduler;

    const CALLER_ID = 101;
    currentTime = 1;

    const calls: Call[] = [];
    model.calls$.subscribe((call) => calls.push(call));

    scheduler.addCaller(CALLER_ID);
    console.log("BEFORE WAIT");
    await scheduler.waitForIdleForTest();
    console.log("AFTER IDLE");

    expect(calls).toStrictEqual([
      expect.objectContaining({
        id: 1,
      }),
    ]);
    const call = calls[0] ?? fail();
    expect(call.id).toBe(1);

    call.update("QUEUED", { twilioSid: "Test" });
    call.update("INITIATED", {});
    call.update("RINGING", {});
    call.update("IN_PROGRESS", {});

    await scheduler.waitForIdleForTest();
    expect(calls).toHaveLength(1);

    const completedCall = call.update("COMPLETED", {
      result: "COMPLETED",
    });

    await scheduler.waitForIdleForTest();
    expect(calls).toHaveLength(2);

    expect(completedCall.callerId).toBe(CALLER_ID);
    scheduler.stop();
  });
});
