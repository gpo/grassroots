import { describe, expect, it } from "vitest";
import { OrganizationsDTO } from "grassroots-shared/dtos/Organization.dto";
import { fail } from "assert";
import { createOrganizationTree } from "grassroots-shared-net/devtools/CreateOrganizationTree";
import { useE2ETestFixture } from "./infra/E2eSetup.js";
import { OrganizationsModule } from "grassroots-backend/organizations/Organizations.module";

describe("Organizations (e2e)", () => {
  const getFixture = useE2ETestFixture({
    imports: [OrganizationsModule],
  });

  it("should create a tree", async () => {
    const f = getFixture();

    const { nameToId } = await createOrganizationTree(f.grassrootsAPI, {
      name: "root",
      children: [
        { name: "A", children: [{ name: "B", children: [{ name: "C" }] }] },
        { name: "Unrelated" },
      ],
    });

    const organizations = OrganizationsDTO.fromFetchOrThrow(
      await f.grassrootsAPI.GET("/organizations"),
    );
    expect(organizations.organizations.length).toEqual(5);

    const ancestors = OrganizationsDTO.fromFetchOrThrow(
      await f.grassrootsAPI.GET("/organizations/ancestors-of/{id}", {
        params: {
          path: {
            id: nameToId.get("C") ?? fail(),
          },
        },
      }),
    );
    expect(ancestors.organizations.map((x) => x.name)).toEqual([
      "B",
      "A",
      "root",
    ]);
  });
});
