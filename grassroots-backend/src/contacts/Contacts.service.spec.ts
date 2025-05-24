import { ContactsService } from "./Contacts.service";
import { getTestApp } from "../testing/GetTestApp";
import { INestApplication } from "@nestjs/common";
import {
  ContactEntityOutDTO,
  CreateContactInDto,
} from "../grassroots-shared/Contact.entity.dto";
import { instanceToPlain, plainToClass } from "class-transformer";
import { EntityManager } from "@mikro-orm/postgresql";
//import { QueryRunnerProvider } from "../providers/QueryRunnerProvider";

describe("ContactsService", () => {
  let service: ContactsService;
  let app: INestApplication;
  let entityManager: EntityManager;

  beforeAll(async () => {
    ({ app } = await getTestApp({}));
    entityManager = app.get<EntityManager>(EntityManager);
    service = app.get<ContactsService>(ContactsService);
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
      plainToClass(ContactEntityOutDTO, {
        ...instanceToPlain(contact),
        id: created.id,
      }),
    );
  });

  it("should have no entries in the test database", async () => {
    const allContacts = await service.findAll();
    expect(allContacts.length).toEqual(0);
  });
});
