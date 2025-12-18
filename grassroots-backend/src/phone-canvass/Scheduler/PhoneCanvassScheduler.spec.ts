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
import { plainToInstance } from "class-transformer";
import { ContactEntity } from "../../contacts/entities/Contact.entity.js";
import { EntityManager } from "@mikro-orm/core";
import { CreateOrUpdatePhoneCanvassCallerDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";

function makeContact(id: number): ContactEntity {
  return plainToInstance(ContactEntity, { id });
}

const FAKE_CONTACTS: PhoneCanvassContactEntity[] = [
  {
    id: 10,
    callStatus: "NOT_STARTED",
    contact: makeContact(0),
  },
  {
    id: 20,
    callStatus: "NOT_STARTED",
    contact: makeContact(1),
  },
  {
    id: 30,
    callStatus: "NOT_STARTED",
    contact: makeContact(2),
  },
].map((x) => plainToInstance(PhoneCanvassContactEntity, x));

let currentTime = -1;

function getModel(): PhoneCanvassModel {
  const factory = new PhoneCanvassModelFactory();

  const model = factory.createModel({
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    twilioService: new TwilioServiceMock() as unknown as TwilioService,
    phoneCanvassId: "fake phone canvass id",
    contacts: FAKE_CONTACTS,
    serverMetaService: new ServerMetaService(),
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    entityManager: {
      findOneOrFail: () => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        return { beenCalled: false } as PhoneCanvassContactEntity;
      },
      flush: () => {
        // ignore
      },
    } as unknown as EntityManager,
    strategyName: "no overcalling",
  });

  const currentTimeMock = vi.fn(() => {
    return currentTime;
  });

  model.mockCurrentTime(currentTimeMock);
  return model;
}

async function addCaller(model: PhoneCanvassModel, id: string): Promise<void> {
  // We currently don't allow registering a caller that is ready, so we
  // need to register, then mark as ready.
  const caller = await model.registerCaller(
    CreateOrUpdatePhoneCanvassCallerDTO.from({
      id,
      displayName: id,
      email: "",
      activePhoneCanvassId: "",
      authToken: "",
      ready: "unready",
    }),
  );
  const updated = caller.toUpdate();
  updated.ready = "ready";
  await model.updateOrCreateCaller(updated);
}

describe("PhoneCanvassScheduler", () => {
  beforeAll(async () => {
    await new PhoneCanvassModule().onModuleInit();
  });
  beforeEach(() => {
    resetPhoneCanvasCallIdsForTest();
  });
  it("should handle a stream of calls in series", async () => {
    const callsById = new Map<number, Call>();
    const model = getModel();
    const scheduler = model.scheduler;
    model.calls$.subscribe({
      next: (call) => callsById.set(call.id, call),
      error: (error: unknown) => {
        throw error;
      },
    });

    expect(callsById).toHaveLength(0);

    currentTime = 11;
    await addCaller(model, "1");

    await scheduler.waitForIdleForTest();

    expect(callsById).toHaveLength(1);
    expect(callsById.get(1)).toBeDefined();

    await addCaller(model, "2");
    await scheduler.waitForIdleForTest();

    expect(callsById).toHaveLength(2);
    expect(callsById.get(2)).toBeDefined();

    await addCaller(model, "3");
    await scheduler.waitForIdleForTest();

    expect(callsById).toHaveLength(3);
    expect(callsById.get(3)).toBeDefined();

    await addCaller(model, "4");
    await scheduler.waitForIdleForTest();

    // There's no new contact to call.
    expect(callsById).toHaveLength(3);
    scheduler.stop();
  });

  it("should handle call updates", async () => {
    const model = getModel();
    const scheduler = model.scheduler;

    const CALLER_ID = "fakeuuid";
    currentTime = 1;

    const callsById = new Map<number, Call>();
    model.calls$.subscribe({
      next: (call) => callsById.set(call.id, call),
      error: (error: unknown) => {
        throw error;
      },
    });

    await addCaller(model, CALLER_ID);

    await scheduler.waitForIdleForTest();
    expect(callsById).toHaveLength(1);

    let call = callsById.get(1) ?? fail();

    call = call
      .update("QUEUED", { twilioSid: "Test" })
      .update("INITIATED", {})
      .update("RINGING", {})
      .update("IN_PROGRESS", {});

    await scheduler.waitForIdleForTest();
    expect(callsById).toHaveLength(1);

    const completedCall = call.update("COMPLETED", {
      result: "COMPLETED",
    });

    await scheduler.waitForIdleForTest();
    expect(callsById).toHaveLength(2);

    // This is no longer the case, as we're waiting for the "answered" callback.
    //expect(completedCall.callerId).toBe(CALLER_ID);
    void completedCall;
    scheduler.stop();
  });
});
