import { describe, expect, it } from "vitest";
import { OrganizationsModule } from "../organizations/Organizations.module";
import { useE2ETestFixture } from "../testing/E2eSetup";
import { OrganizationsDTO } from "../grassroots-shared/Organization.dto";
import { createOrganizationTree } from "../testing/testHelpers/CreateOrganizationTree";
import { fail } from "assert";

describe("Organizations (e2e)", () => {
  const getFixture = useE2ETestFixture({
    imports: [OrganizationsModule],
  });

  it("should create a tree", async () => {
    const f = getFixture();

    const { nameToId } = await createOrganizationTree(f, {
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
