import { describe, expect, it } from "vitest";
import { useE2ETestFixture } from "../testing/E2eSetup";
import { UsersModule } from "./Users.module";
import { createOrganizationTree } from "../testing/testHelpers/CreateOrganizationTree";
import { Permission, PermissionsDTO } from "grassroots-shared/Permission.dto";
import { fail } from "grassroots-shared/src/util/Fail";
import { OrganizationsModule } from "../organizations/Organizations.module";
import { ROLES_BY_NAME } from "../organizations/Roles.service";
import { UserDTO } from "grassroots-shared/User.dto";

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

    const user = UserDTO.fromFetchOrThrow(
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

    const noAccessPermissions = PermissionsDTO.fromFetchOrThrow(
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

    const directPermission = PermissionsDTO.fromFetchOrThrow(
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

    const indirectPermission = PermissionsDTO.fromFetchOrThrow(
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
