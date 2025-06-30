import { useTestFixture } from "../testing/Setup";
import { describe, expect, it } from "vitest";
import { OrganizationsModule } from "./Organizations.module";
import { OrganizationsService } from "./Organizations.service";

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

  it("should create a tree", async () => {
    const { service } = useService();
    // Ensure these variables go out of scope, we don't want to rely on their values
    // in the following test, we want everything to come from the database.
    {
      const A = await service.createRootOrganization({
        name: "A",
      });

      const B = await service.create({
        name: "B",
        parentID: A.id,
      });

      await service.create({
        name: "C",
        parentID: B.id,
      });

      await service.create({
        name: "Unrelated",
        parentID: A.id,
      });
    }

    const allOrganizations = await service.findAll();
    expect(allOrganizations.length).toEqual(4);

    const cAncestors = service.getAncestors(await service.findOneByName("C"));
    expect(cAncestors.map((x) => x.name)).toEqual(["B", "A"]);

    const bAncestors = service.getAncestors(await service.findOneByName("B"));
    expect(bAncestors.map((x) => x.name)).toEqual(["A"]);

    const aAncestors = service.getAncestors(await service.findOneByName("A"));
    expect(aAncestors.map((x) => x.name)).toEqual([]);
  });
});
