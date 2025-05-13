import { NestExpressApplication } from "@nestjs/platform-express";
import { Client } from "openapi-fetch";
import { paths } from "../src/grassroots-shared/openAPI.gen";
import { e2eBeforeAll } from "../src/testing/e2eSetup";
import { QueryRunner } from "typeorm";
import { ContactsController } from "../src/contacts/contacts.controller";
import { ContactsService } from "../src/contacts/contacts.service";
import { ContactEntityOutDTO } from "../src/grassroots-shared/contact.entity.dto";
import { QueryRunnerProvider } from "../src/providers/QueryRunnerProvider";

const TEST_CONTACT = {
  email: "test@test.com",
  firstName: "Test",
  lastName: "Test",
  phoneNumber: "226-999-9999",
};

describe("ContactsController (e2e)", () => {
  let app: NestExpressApplication;
  let grassrootsAPI: Client<paths>;
  let queryRunner: QueryRunner;

  beforeAll(async () => {
    ({ app, grassrootsAPI, queryRunner } = await e2eBeforeAll({
      controllers: [ContactsController],
      providers: [
        QueryRunnerProvider.getProviderFor(
          ContactsService,
          ContactEntityOutDTO,
          (repo) => new ContactsService(repo),
        ),
      ],
    }));
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

  it("creates a contact", async () => {
    const { data, response } = await grassrootsAPI.POST("/contacts", {
      body: TEST_CONTACT,
    });

    expect(response.status).toBe(201);
    expect(data?.email).toBe("test@test.com");
  });

  it("validates its inputs", async () => {
    const result = await grassrootsAPI.POST("/contacts", {
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
    let { response } = await grassrootsAPI.POST("/contacts", {
      body: TEST_CONTACT,
    });

    expect(response.status).toBe(201);

    ({ response } = await grassrootsAPI.POST("/contacts", {
      body: {
        ...TEST_CONTACT,
        email: "foo@foo.com",
      },
    }));

    expect(response.status).toBe(201);

    const { data, response: searchResponse } = await grassrootsAPI.POST(
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
