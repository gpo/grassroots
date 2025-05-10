import { ContactsController } from "./contacts.controller";
import { getTestApp } from "../testing/getTestApp";
import { ContactsService } from "./contacts.service";
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
