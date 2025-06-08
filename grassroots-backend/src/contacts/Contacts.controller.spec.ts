import { ContactsController } from "./Contacts.controller";
import { getTestApp } from "../testing/GetTestApp";
import { ContactsService } from "./Contacts.service";
import { NestExpressApplication } from "@nestjs/platform-express";
import { EntityManager } from "@mikro-orm/postgresql";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

describe("ContactsController", () => {
  let controller: ContactsController;
  let app: NestExpressApplication;
  let entityManager: EntityManager;

  beforeAll(async () => {
    ({ app } = await getTestApp({
      controllers: [ContactsController],
      providers: [ContactsService],
    }));
    entityManager = app.get<EntityManager>(EntityManager);
    controller = app.get<ContactsController>(ContactsController);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await entityManager.begin();
  });

  afterEach(async () => {
    await entityManager.rollback();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
