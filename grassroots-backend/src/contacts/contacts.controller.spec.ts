import { ContactsController } from "./contacts.controller";
import { getRootTestingModuleAndDataSource } from "../roottest.module";
import { TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";

let moduleRef: TestingModule | undefined;
let app: INestApplication<any> | undefined;

describe("ContactsController", () => {
  let controller: ContactsController;

  beforeEach(async () => {
    [moduleRef, app] = await getRootTestingModuleAndDataSource();
    controller = moduleRef.get<ContactsController>(ContactsController);
  });

  afterAll(async () => {
    await app?.close();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
