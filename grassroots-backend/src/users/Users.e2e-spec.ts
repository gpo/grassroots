import { describe, expect, it } from "vitest";
import { useE2ETestFixture } from "../testing/E2eSetup";
import { UsersModule } from "./Users.module";
import { createOrganizationTree } from "../testing/testHelpers/CreateOrganizationTree";
import { Permission } from "../grassroots-shared/Permission.dto";
import { fail } from "../grassroots-shared/util/Fail";
import { OrganizationsModule } from "../organizations/Organizations.module";
import { fetchSuccessOrThrow } from "../grassroots-shared/util/FetchSuccessOrThrow";
import { ROLES_BY_NAME } from "../organizations/Roles.service";

describe("Users (e2e)", () => {
  const getFixture = useE2ETestFixture({
    imports: [UsersModule, OrganizationsModule],
  });

  it("should return valid permissions", async () => {
    const f = getFixture();
    const { nameToId } = await createOrganizationTree(f, {
      name: "root",
      children: [
        { name: "A", children: [{ name: "B", children: [{ name: "C" }] }] },
        { name: "Unrelated" },
      ],
    });

    const user = fetchSuccessOrThrow(
      await f.grassrootsAPI.POST("/users/find-or-create", {
        body: {
          displayName: "A",
          emails: undefined,
          firstName: "A",
          id: "testUserID",
          lastName: "A",
          userRoles: [
            {
              inherited: true,
              organizationId: nameToId.get("B") ?? fail(),
              role: ROLES_BY_NAME.get("View Only")?.toDTO() ?? fail(),
            },
          ],
        },
      }),
    );

    const noAccessPermissions = fetchSuccessOrThrow(
      await f.grassrootsAPI.GET("/users/user-permissions-for-org", {
        params: {
          query: {
            organizationId: nameToId.get("root") ?? fail(),
            userId: user.id,
          },
        },
      }),
    );

    expect(noAccessPermissions.permissions).toEqual([]);

    const directPermission = fetchSuccessOrThrow(
      await f.grassrootsAPI.GET("/users/user-permissions-for-org", {
        params: {
          query: {
            organizationId: nameToId.get("B") ?? fail(),
            userId: user.id,
          },
        },
      }),
    );

    expect(directPermission.permissions).toEqual([
      "VIEW_CONTACTS",
    ] satisfies Permission[]);

    const indirectPermission = fetchSuccessOrThrow(
      await f.grassrootsAPI.GET("/users/user-permissions-for-org", {
        params: {
          query: {
            organizationId: nameToId.get("C") ?? fail(),
            userId: user.id,
          },
        },
      }),
    );

    expect(indirectPermission.permissions).toEqual([
      "VIEW_CONTACTS",
    ] satisfies Permission[]);
  });
});
