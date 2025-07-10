import { assert, describe, expect, it } from "vitest";
import { useE2ETestFixture } from "../testing/E2eSetup";
import { UsersModule } from "./Users.module";

describe("Users (e2e)", () => {
  const getFixture = useE2ETestFixture({
    imports: [UsersModule],
  });

  it("should return valid permissions", async () => {
    const f = getFixture();
    const { data } = await f.grassrootsAPI.GET("/roles");
    assert(data !== undefined);
    expect(data.length).toEqual(4);
    expect(data[0]?.name).toEqual("No Permissions");
  });
});
