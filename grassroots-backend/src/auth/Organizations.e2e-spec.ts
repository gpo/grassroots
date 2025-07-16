import { describe, expect, it } from "vitest";
import { OrganizationsModule } from "../organizations/Organizations.module";
import { useE2ETestFixture } from "../testing/E2eSetup";
import {
  OrganizationDTO,
  OrganizationsDTO,
} from "../grassroots-shared/Organization.dto";

describe("Organizations (e2e)", () => {
  const getFixture = useE2ETestFixture({
    imports: [OrganizationsModule],
  });

  it("should create a tree", async () => {
    const f = getFixture();
    const a = OrganizationDTO.fromFetchOrThrow(
      await f.grassrootsAPI.POST("/organizations/create-root", {
        body: {
          name: "A",
        },
      }),
    );
    expect(a.parentId).toEqual(undefined);

    const b = OrganizationDTO.fromFetchOrThrow(
      await f.grassrootsAPI.POST("/organizations", {
        body: {
          name: "B",
          parentID: a.id,
        },
      }),
    );

    expect(b.parentId).toEqual(a.id);

    const c = OrganizationDTO.fromFetchOrThrow(
      await f.grassrootsAPI.POST("/organizations", {
        body: {
          name: "C",
          parentID: b.id,
        },
      }),
    );

    await f.grassrootsAPI.POST("/organizations", {
      body: {
        name: "Unrelated",
        parentID: a.id,
      },
    });

    const organizations = OrganizationsDTO.fromFetchOrThrow(
      await f.grassrootsAPI.GET("/organizations"),
    );
    expect(organizations.organizations.length).toEqual(4);

    const ancestors = OrganizationsDTO.fromFetchOrThrow(
      await f.grassrootsAPI.GET("/organizations/ancestors-of/{id}", {
        params: {
          path: {
            id: c.id,
          },
        },
      }),
    );
    expect(ancestors.organizations.map((x) => x.name)).toEqual(["B", "A"]);
  });
});
