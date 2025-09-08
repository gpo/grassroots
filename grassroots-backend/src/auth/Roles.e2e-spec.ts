import { describe, expect, it } from "vitest";
import { OrganizationsModule } from "../organizations/Organizations.module.js";
import { useE2ETestFixture } from "../testing/E2eSetup.js";
import { RolesDTO } from "../grassroots-shared/Role.dto.js";

describe("Roles (e2e)", () => {
  const getFixture = useE2ETestFixture({
    imports: [OrganizationsModule],
  });

  it("should return roles", async () => {
    const f = getFixture();
    const roles = RolesDTO.fromFetchOrThrow(
      await f.grassrootsAPI.GET("/roles"),
    ).roles;
    expect(roles.length).toEqual(4);
    expect(roles[0]?.name).toEqual("No Permissions");
  });
});
