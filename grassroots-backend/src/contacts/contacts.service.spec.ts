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
import { QueryRunner } from "typeorm";
import { plainToClass } from "class-transformer";

describe("ContactsService", () => {
  let service: ContactsService;
  let app: INestApplication;

  beforeAll(async () => {
    app = await getTestApp();
    service = app.get<ContactsService>(ContactsService);
  });

  afterAll(async () => {
    await app.close();
  });

  let queryRunner: QueryRunner;
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
    const created = await service.create(contact, queryRunner);

    const allContacts = await service.findAll(queryRunner);
    expect(allContacts.length).toEqual(1);
    expect(allContacts[0]).toEqual(
      plainToClass(ContactEntityOutDTO, { ...contact, id: created.id }),
    );
  });
});
