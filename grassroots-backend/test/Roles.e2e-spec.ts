import { assert, describe, expect, it } from "vitest";
import { useE2ETestFixture } from "../src/testing/E2eSetup";
import { OrganizationsModule } from "../src/organizations/Organizations.module";

describe("Roles (e2e)", () => {
  const getFixture = useE2ETestFixture({
    imports: [OrganizationsModule],
  });

  it("should return roles", async () => {
    const f = getFixture();
    const { data } = await f.grassrootsAPI.GET("/roles");
    assert(data !== undefined);
    expect(data.length).toEqual(4);
    expect(data[0]?.name == "Test");
  });
});
