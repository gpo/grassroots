/*
describe("OrganizationsService", () => {
  const getFixture = useTestFixture({
    imports: [OrganizationsModule],
  });

  function useService(): {
    service: OrganizationsService;
  } {
    const fixture = getFixture();

    return {
      service: fixture.app.get<OrganizationsService>(OrganizationsService),
    };
  }


});*/

import { assert, describe, expect, it } from "vitest";
import { useE2ETestFixture } from "../src/testing/E2eSetup";
import { OrganizationsModule } from "../src/organizations/Organizations.module";

describe("Organizations (e2e)", () => {
  const getFixture = useE2ETestFixture({
    imports: [OrganizationsModule],
  });

  it("should create a tree", async () => {
    const f = getFixture();
    const { data: a } = await f.grassrootsAPI.POST(
      "/organizations/create-root",
      {
        body: {
          name: "A",
        },
      },
    );
    assert(a !== undefined);

    const { data: b } = await f.grassrootsAPI.POST("/organizations", {
      body: {
        name: "B",
        parentID: a.id,
      },
    });
    assert(b !== undefined);

    await f.grassrootsAPI.POST("/organizations", {
      body: {
        name: "C",
        parentID: b.id,
      },
    });

    await f.grassrootsAPI.POST("/organizations", {
      body: {
        name: "Unrelated",
        parentID: a.id,
      },
    });

    const { data: organizations } = await f.grassrootsAPI.GET("/organizations");
    assert(organizations !== undefined);
    expect(organizations.length).toEqual(4);

    const cAncestors = service.getAncestors(await service.findOneByName("C"));
    expect(cAncestors.map((x) => x.name)).toEqual(["B", "A"]);

    const bAncestors = service.getAncestors(await service.findOneByName("B"));
    expect(bAncestors.map((x) => x.name)).toEqual(["A"]);

    const aAncestors = service.getAncestors(await service.findOneByName("A"));
    expect(aAncestors.map((x) => x.name)).toEqual([]);
  });

  it("creates a contact", async () => {
    const f = getFixture();
    const { data, response } = await f.grassrootsAPI.POST("/contacts", {
      body: TEST_CONTACT,
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
            TEST_CONTACT,
            { ...TEST_CONTACT, email: "foo@bar.com" },
            { ...TEST_CONTACT, email: "foo2@bar.com" },
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
    const f = getFixture();

    const { response } = await f.grassrootsAPI.POST("/contacts", {
      body: TEST_CONTACT,
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
