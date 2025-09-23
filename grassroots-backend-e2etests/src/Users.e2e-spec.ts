import { describe, expect, it } from "vitest";
import {
  Permission,
  PermissionsDTO,
} from "grassroots-shared/dtos/Permission.dto";
import { fail } from "grassroots-shared/util/Fail";
import { UserDTO } from "grassroots-shared/dtos/User.dto";
import { useE2ETestFixture } from "./infra/E2eSetup.js";
import { createOrganizationTree } from "grassroots-shared-net/devtools/CreateOrganizationTree";
import { UsersModule } from "grassroots-backend/users/Users.module";
import { OrganizationsModule } from "grassroots-backend/organizations/Organizations.module";
import { ROLES_BY_NAME } from "grassroots-backend/organizations/Roles.service";

describe("Users (e2e)", () => {
  const getFixture = useE2ETestFixture({
    imports: [UsersModule, OrganizationsModule],
  });

  it("should return valid permissions", async () => {
    const f = getFixture();
    const { nameToId } = await createOrganizationTree(f.grassrootsAPI, {
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
