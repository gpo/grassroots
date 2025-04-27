import { TestingModule } from "@nestjs/testing";
import { ContactsService } from "./contacts.service";
import { getRootTestingModuleAndDataSource } from "../roottest.module";
import { INestApplication } from "@nestjs/common";

let moduleRef: TestingModule | undefined;
let app: INestApplication<any> | undefined;

describe("ContactsService", () => {
  let service: ContactsService;

  beforeEach(async () => {
    [moduleRef, app] = await getRootTestingModuleAndDataSource();
    service = moduleRef.get<ContactsService>(ContactsService);
  });

  afterAll(async () => {
    await app?.close();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
