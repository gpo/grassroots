import { describe, expect, it } from "vitest";
import { RolesDTO } from "grassroots-shared/dtos/Role.dto";
import { OrganizationsModule } from "grassroots-backend/organizations/Organizations.module";
import { useE2ETestFixture } from "./infra/E2eSetup.js";

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
