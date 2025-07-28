import { ContactsService } from "./Contacts.service";
import { useTestFixture } from "../testing/Setup";
import { describe, expect, it } from "vitest";
import { ContactsModule } from "./Contacts.module";
import { CreateContactRequestDTO } from "@grassroots/shared";

describe("ContactsService", () => {
  const getFixture = useTestFixture({
    imports: [ContactsModule],
  });

  function useService(): { service: ContactsService } {
    const fixture = getFixture();

    return {
      service: fixture.app.get<ContactsService>(ContactsService),
    };
  }

  it("should be defined", () => {
    const { service } = useService();
    expect(service).toBeDefined();
  });

  it("should create and return a contact", async () => {
    const { service } = useService();
    const contact = CreateContactRequestDTO.from({
      email: "test@test.com",
      firstName: "Test",
      lastName: "Test",
      phoneNumber: "999-999-9999",
    });
    const created = await service.create(contact);

    const allContacts = await service.findAll();
    expect(allContacts.length).toEqual(1);

    expect(allContacts[0]?.id).toEqual(created.id);
    expect(allContacts[0]?.firstName).toEqual(contact.firstName);
  });

  it("should have no entries in the test database", async () => {
    const { service } = useService();
    const allContacts = await service.findAll();
    expect(allContacts.length).toEqual(0);
  });
});
