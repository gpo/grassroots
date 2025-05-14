import { ContactsController } from "../src/contacts/contacts.controller";
import { ContactsService } from "../src/contacts/contacts.service";
import { ContactEntityOutDTO } from "../src/grassroots-shared/contact.entity.dto";
import { QueryRunnerProvider } from "../src/providers/QueryRunnerProvider";
import { useE2ETestFixture } from "../src/testing/e2eSetup";

const TEST_CONTACT = {
  email: "test@test.com",
  firstName: "Test",
  lastName: "Test",
  phoneNumber: "226-999-9999",
};

describe("ContactsController (e2e)", () => {
  const getFixture = useE2ETestFixture({
    controllers: [ContactsController],
    providers: [
      QueryRunnerProvider.getProviderFor(
        ContactsService,
        ContactEntityOutDTO,
        (repo) => new ContactsService(repo),
      ),
    ],
  });

  it("creates a contact", async () => {
    const f = getFixture();
    const { data, response } = await f.grassrootsAPI.POST("/contacts", {
      body: TEST_CONTACT,
    });

    expect(response.status).toBe(201);
    expect(data?.email).toBe("test@test.com");
  });

  it("validates its inputs", async () => {
    const f = getFixture();
    const result = await f.grassrootsAPI.POST("/contacts", {
      body: {
        ...TEST_CONTACT,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        email: 0 as unknown as string,
      },
    });
    expect(result.response.status).toEqual(400);
    expect(result.error?.message).toEqual(["email must be an email"]);
  });

  it("returns search results", async () => {
    const f = getFixture();
    let { response } = await f.grassrootsAPI.POST("/contacts", {
      body: TEST_CONTACT,
    });

    expect(response.status).toBe(201);

    ({ response } = await f.grassrootsAPI.POST("/contacts", {
      body: {
        ...TEST_CONTACT,
        email: "foo@foo.com",
      },
    }));

    expect(response.status).toBe(201);

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
    expect(data?.paginated).toEqual({
      rowsSkipped: 0,
      rowsTotal: 1,
    });
  });

  it("returns no search results for an empty query", async () => {
    const { response } = await grassrootsAPI.POST("/contacts", {
      body: TEST_CONTACT,
    });

    expect(response.status).toBe(201);

    const { data, response: searchResponse } = await grassrootsAPI.POST(
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
