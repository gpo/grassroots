import { useTestFixture } from "../testing/Setup";
import { describe, expect, it } from "vitest";
import { OrganizationsModule } from "./Organizations.module";
import { RolesService } from "./Roles.service";

describe("RolesService", () => {
  const getFixture = useTestFixture({
    imports: [OrganizationsModule],
  });

  function useService(): {
    service: RolesService;
  } {
    const fixture = getFixture();

    return {
      service: fixture.app.get<RolesService>(RolesService),
    };
  }

  it("should allow creation of default roles", async () => {
    const { service } = useService();

    await service.recreateRoles();
    await service.recreateRoles();
    const roles = await service.findAll();
    expect(roles.length).toEqual(4);
  });
});
