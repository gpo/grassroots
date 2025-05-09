import { ContactsService } from "./contacts.service";
import { getTestApp } from "../testing/getTestApp";
import { INestApplication } from "@nestjs/common";
import {
  ContactEntityOutDTO,
  CreateContactInDto,
} from "../grassroots-shared/contact.entity.dto";
import {
  rollbackTestTransaction,
  startTestTransaction,
} from "../testing/dbTransactions";
import { DataSource, QueryRunner } from "typeorm";
import { plainToClass } from "class-transformer";
import { setQueryRunnerForTest } from "../getRepo";

describe("ContactsService", () => {
  let service: ContactsService;
  let app: INestApplication;
  let queryRunner: QueryRunner;

  beforeAll(async () => {
    app = await getTestApp();
    service = app.get<ContactsService>(ContactsService);
    const dataSource = app.get(DataSource);
    queryRunner = dataSource.createQueryRunner();
    setQueryRunnerForTest(queryRunner);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    queryRunner = await startTestTransaction();
  });

  afterEach(async () => {
    await rollbackTestTransaction();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should create and return a contact", async () => {
    const contact: CreateContactInDto = {
      email: "test@test.com",
      firstName: "Test",
      lastName: "Test",
      phoneNumber: "999-999-9999",
    };
    const created = await service.create(contact);

    const allContacts = await service.findAll();
    expect(allContacts.length).toEqual(1);
    expect(allContacts[0]).toEqual(
      plainToClass(ContactEntityOutDTO, { ...contact, id: created.id }),
    );
  });
});
