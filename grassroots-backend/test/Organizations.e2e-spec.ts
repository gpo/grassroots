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

    const { data: c } = await f.grassrootsAPI.POST("/organizations", {
      body: {
        name: "C",
        parentID: b.id,
      },
    });
    assert(c !== undefined);

    await f.grassrootsAPI.POST("/organizations", {
      body: {
        name: "Unrelated",
        parentID: a.id,
      },
    });

    const { data: organizations } = await f.grassrootsAPI.GET("/organizations");
    assert(organizations !== undefined);
    expect(organizations.length).toEqual(4);

    const { data: ancestors } = await f.grassrootsAPI.GET(
      "/organizations/ancestors-of/{id}",
      {
        params: {
          path: {
            id: c.id,
          },
        },
      },
    );
    assert(ancestors !== undefined);
    expect(ancestors.map((x) => x.name)).toEqual(["B", "A"]);

    expect(a.parent.value == "unloaded");
    expect(b.parent != null);
  });
});
