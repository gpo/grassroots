import { ContactsService } from "./contacts.service";
import { getTestApp } from "../testing/getTestApp";
import { INestApplication } from "@nestjs/common";
import {
  ContactEntityOutDTO,
  CreateContactInDto,
} from "../grassroots-shared/contact.entity.dto";
import { QueryRunner } from "typeorm";
import { plainToClass } from "class-transformer";
import { QueryRunnerProvider } from "../providers/QueryRunnerProvider";

describe("ContactsService", () => {
  let service: ContactsService;
  let app: INestApplication;
  let queryRunner: QueryRunner;

  beforeAll(async () => {
    ({ app, queryRunner } = await getTestApp({
      providers: [
        QueryRunnerProvider.getProviderFor(
          ContactsService,
          ContactEntityOutDTO,
          (repo) => new ContactsService(repo),
        ),
      ],
    }));
    service = app.get<ContactsService>(ContactsService);
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
