import { describe, expect, it } from "vitest";
import { writeFile, readFile } from "fs/promises";
import { ContactsModule } from "./Contacts.module";
import { useE2ETestFixture } from "../testing/E2eSetup";
import { graphDependencies } from "../util/GraphDependencies";
import { CreateContactRequestDTO } from "../grassroots-shared/Contact.dto";
import { OrganizationDTO } from "../grassroots-shared/Organization.dto";
import { OrganizationsModule } from "../organizations/Organizations.module";
import { PropsOf } from "../grassroots-shared/util/TypeUtils";

describe("ContactsController (e2e)", () => {
  // Created in fixture setup.
  let rootOrganization!: OrganizationDTO;

  // Created in fixture setup.
  let testContact: PropsOf<CreateContactRequestDTO>;
  const getFixture = useE2ETestFixture({
    imports: [ContactsModule, OrganizationsModule],
    injectCommonTestData: async (f) => {
      rootOrganization = OrganizationDTO.fromFetchOrThrow(
        await f.grassrootsAPI.POST("/organizations/create-root", {
          body: {
            name: "Root organization",
          },
        }),
      );

      testContact = CreateContactRequestDTO.from({
        email: "test@test.com",
        firstName: "Test",
        lastName: "Test",
        phoneNumber: "226-999-9999",
        organizationId: rootOrganization.id,
      });
    },
  });

  /*beforeAll(async () => {
    const f = getFixture();
    rootOrganization = OrganizationDTO.fromFetchOrThrow(
      await f.grassrootsAPI.POST("/organizations/create-root", {
        body: {
          name: "Root organization",
        },
      }),
    );

    testContact = CreateContactRequestDTO.from({
      email: "test@test.com",
      firstName: "Test",
      lastName: "Test",
      phoneNumber: "226-999-9999",
      organizationId: rootOrganization.id,
    });
  });*/

  it("generates dependency graph", async () => {
    const f = getFixture();
    const PATH = "../docs/DependencyGraphForTest.md";

    await writeFile(PATH, graphDependencies(f.app));
    const written = await readFile(PATH, "utf8");

    expect(written.length).toBeGreaterThan(0);
  });

  it("creates a contact", async () => {
    const f = getFixture();
    const { data, response } = await f.grassrootsAPI.POST("/contacts", {
      body: testContact,
    });

    expect(response.status).toBe(201);
    expect(data?.email).toBe("test@test.com");
  });

  it("bulk creates contacts", async () => {
    const f = getFixture();
    const { data, response } = await f.grassrootsAPI.POST(
      "/contacts/bulk-create",
      {
        body: {
          contacts: [
            testContact,
            { ...testContact, email: "foo@bar.com" },
            { ...testContact, email: "foo2@bar.com" },
          ],
        },
      },
    );

    expect(response.status).toBe(201);
    const ids = data?.ids;
    expect(ids?.length).toBe(3);
  });

  it("validates its inputs", async () => {
    const f = getFixture();
    const result = await f.grassrootsAPI.POST("/contacts", {
      body: {
        ...testContact,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        email: 0 as unknown as string,
      },
    });
    expect(result.response.status).toEqual(400);
    expect(result.error?.message).toEqual(["email must be an email"]);
  });

  it("returns search results", async () => {
    const f = getFixture();
    const { response: response1, error } = await f.grassrootsAPI.POST(
      "/contacts",
      {
        body: testContact,
      },
    );

    expect(
      response1.status,
      JSON.stringify(error) + JSON.stringify(response1),
    ).toBe(201);

    const { response: response2 } = await f.grassrootsAPI.POST("/contacts", {
      body: {
        ...testContact,
        email: "foo@foo.com",
      },
    });

    expect(response2.status).toBe(201);

    const { data, response: searchResponse } = await f.grassrootsAPI.POST(
      "/contacts/search",
      {
        body: {
          contact: {
            email: "foo@foo.com",
          },
          paginated: {
            rowsToSkip: 0,
            rowsToTake: 10,
          },
        },
      },
    );
    expect(searchResponse.status).toBe(201);
    expect(data?.contacts.length).toBe(1);
    expect(data?.contacts[0]?.email).toBe("foo@foo.com");
    expect(data?.paginated).toMatchObject({
      rowsSkipped: 0,
      rowsTotal: 1,
    });
  });

  it("returns no search results for an empty query", async () => {
    const f = getFixture();

    const { response } = await f.grassrootsAPI.POST("/contacts", {
      body: testContact,
    });

    expect(response.status).toBe(201);

    const { data, response: searchResponse } = await f.grassrootsAPI.POST(
      "/contacts/search",
      {
        body: {
          contact: {},
          paginated: {
            rowsToSkip: 0,
            rowsToTake: 10,
          },
        },
      },
    );
    expect(searchResponse.status).toBe(201);
    expect(data?.contacts.length).toBe(0);
  });
});
