import { assert, describe, expect, it } from "vitest";
import { useE2ETestFixture } from "../src/testing/E2eSetup";
import { OrganizationsModule } from "../src/organizations/Organizations.module";
import * as MaybeLoaded from "../src/grassroots-shared/MaybeLoaded";

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
    expect(MaybeLoaded.isLoaded(a.parent)).toBe(true);
    expect(a.parent !== undefined);

    const { data: b } = await f.grassrootsAPI.POST("/organizations", {
      body: {
        name: "B",
        parentID: a.id,
      },
    });

    assert(b !== undefined);
    expect(MaybeLoaded.getOrThrow(b.parent)?.id).toBe(a.id);

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

    await f.entityManager.flush();

    // Test unloaded parents.
    const { data: cFlushed } = await f.grassrootsAPI.GET(
      "/organizations/{id}",
      {
        params: {
          path: {
            id: c.id,
          },
        },
      },
    );
    const cParent = MaybeLoaded.getOrThrow(cFlushed?.parent);
    const cParentParent = MaybeLoaded.getOrThrow(cParent)?.parent;
    console.log(cParentParent);
  });
});
