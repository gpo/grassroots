import { describe, expect, it } from "vitest";
import { ContactsModule } from "./Contacts.module";
import { useE2ETestFixture } from "../testing/E2eSetup";
import { CreateContactRequestDTO } from "../grassroots-shared/Contact.dto";
import { OrganizationsModule } from "../organizations/Organizations.module";
import { PropsOf } from "../grassroots-shared/util/TypeUtils";
import { TEMPORARY_FAKE_ORGANIZATION_ID } from "../grassroots-shared/Organization.dto";

// Until we have frontend for dealing with organizations, we just
// create a dummy organization if none exists and we try to create a contact.

describe("ContactsController with dummy org (e2e)", () => {
  // Created in beforeEach.
  let testContact: PropsOf<CreateContactRequestDTO>;
  const getFixture = useE2ETestFixture({
    imports: [ContactsModule, OrganizationsModule],
  });

  it("creates an organization when you create a contact with organizationId -1", async () => {
    const f = getFixture();

    testContact = CreateContactRequestDTO.from({
      email: "test@test.com",
      firstName: "Test",
      lastName: "Test",
      phoneNumber: "226-999-9999",
      organizationId: TEMPORARY_FAKE_ORGANIZATION_ID,
    });

    const { data, response } = await f.grassrootsAPI.POST("/contacts", {
      body: testContact,
    });

    expect(response.status).toBe(201);
    expect(data?.email).toBe("test@test.com");
  });
});
