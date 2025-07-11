import { assert, describe, expect, it } from "vitest";
import { useE2ETestFixture } from "../testing/E2eSetup";
import { UsersModule } from "./Users.module";
import { createOrganizationTree } from "../testing/testHelpers/CreateOrganizationTree";

describe("Users (e2e)", () => {
  const getFixture = useE2ETestFixture({
    imports: [UsersModule],
  });

  it("should return valid permissions", async () => {
    const f = getFixture();
    await createOrganizationTree(f, {
      name: "root",
      children: [
        { name: "A", children: [{ name: "B", children: [{ name: "C" }] }] },
        { name: "Unrelated" },
      ],
    });
    const { data } = await f.grassrootsAPI.GET("/roles");
    assert(data !== undefined);
    expect(data.length).toEqual(4);
    expect(data[0]?.name).toEqual("No Permissions");
  });
});
