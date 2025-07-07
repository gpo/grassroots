import { assert, describe, expect, it } from "vitest";
import { OrganizationsModule } from "../organizations/Organizations.module";
import { useE2ETestFixture } from "../testing/E2eSetup";

describe("Roles (e2e)", () => {
  const getFixture = useE2ETestFixture({
    imports: [OrganizationsModule],
  });

  it("should return roles", async () => {
    const f = getFixture();
    const { data } = await f.grassrootsAPI.GET("/roles");
    assert(data !== undefined);
    expect(data.length).toEqual(4);
    expect(data[0]?.name).toEqual("No Permissions");
  });
});
