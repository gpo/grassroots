import { ContactsService } from "./Contacts.service";
import {
  ContactEntityOutDTO,
  CreateContactInDto,
} from "../grassroots-shared/Contact.entity.dto";
import { instanceToPlain, plainToClass } from "class-transformer";
import { useTestFixture } from "../testing/Setup";

describe("ContactsService", () => {
  const getFixture = useTestFixture({
    providers: [ContactsService],
  });

  function getService(): ContactsService {
    return getFixture().app.get<ContactsService>(ContactsService);
  }

  it("should be defined", () => {
    expect(getService()).toBeDefined();
  });

  it("should create and return a contact", async () => {
    const service = getService();
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
    const allContacts = await getService().findAll();
    expect(allContacts.length).toEqual(0);
  });
});
