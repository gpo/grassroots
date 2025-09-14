import { ContactsService } from "./Contacts.service.js";
import { useTestFixture } from "../testing/TestSetup.js";
import { describe, expect, it } from "vitest";
import { ContactsModule } from "./Contacts.module.js";
import { CreateContactRequestDTO } from "grassroots-shared/dtos/Contact.dto";
import { OrganizationsModule } from "../organizations/Organizations.module.js";
import { OrganizationsService } from "../organizations/Organizations.service.js";
import { CreateOrganizationNoParentRequestDTO } from "grassroots-shared/dtos/Organization.dto";

describe("ContactsService", () => {
  const getFixture = useTestFixture({
    imports: [ContactsModule, OrganizationsModule],
  });

  function useService(): {
    service: ContactsService;
    organizationsService: OrganizationsService;
  } {
    const fixture = getFixture();

    return {
      service: fixture.app.get<ContactsService>(ContactsService),
      organizationsService:
        fixture.app.get<OrganizationsService>(OrganizationsService),
    };
  }

  it("should be defined", () => {
    const { service } = useService();
    expect(service).toBeDefined();
  });

  it("should create and return a contact", async () => {
    const { service, organizationsService } = useService();

    const organization = await organizationsService.create(
      CreateOrganizationNoParentRequestDTO.from({
        name: "root",
        abbreviatedName: "root",
        description: "Test Description",
      }),
      null,
    );
    const contact = CreateContactRequestDTO.from({
      email: "test@test.com",
      firstName: "Test",
      lastName: "Test",
      phoneNumber: "999-999-9999",
      organizationId: organization.id,
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
