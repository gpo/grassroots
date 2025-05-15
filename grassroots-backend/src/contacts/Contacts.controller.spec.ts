import { ContactsController } from "./Contacts.controller";
import { getTestApp } from "../testing/GetTestApp";
import { ContactsService } from "./Contacts.service";
import { NestExpressApplication } from "@nestjs/platform-express";
import { QueryRunner } from "typeorm";

describe("ContactsController", () => {
  let controller: ContactsController;
  let app: NestExpressApplication;
  let queryRunner: QueryRunner;

  beforeAll(async () => {
    ({ app, queryRunner } = await getTestApp({
      controllers: [ContactsController],
      providers: [ContactsService],
    }));
    controller = app.get<ContactsController>(ContactsController);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await queryRunner.startTransaction();
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
