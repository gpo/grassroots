import { ContactsController } from "./contacts.controller";
import { getTestApp } from "../testing/getTestApp";
import { INestApplication } from "@nestjs/common";
import {
  rollbackTestTransaction,
  startTestTransaction,
} from "../testing/dbTransactions";

describe("ContactsController", () => {
  let controller: ContactsController;
  let app: INestApplication;

  beforeAll(async () => {
    app = await getTestApp();
    controller = app.get<ContactsController>(ContactsController);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await startTestTransaction();
  });

  afterEach(async () => {
    await rollbackTestTransaction();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
