import { assert, describe, expect, it } from "vitest";
import { useE2ETestFixture } from "../testing/E2eSetup";
import { UsersModule } from "./Users.module";
import { createOrganizationTree } from "../testing/testHelpers/CreateOrganizationTree";
import { Permission } from "../grassroots-shared/Permission";
import { fail } from "../grassroots-shared/util/Fail";

describe("Users (e2e)", () => {
  const getFixture = useE2ETestFixture({
    imports: [UsersModule],
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

    const { data: user } = await f.grassrootsAPI.POST("/users/find-or-create", {
      body: {
        displayName: "A",
        emails: undefined,
        firstName: "A",
        id: "testUserID",
        lastName: "A",
        userRoles: [
          {
            inherited: false,
            organizationId: nameToId.get("B") ?? fail(),
            role: {
              permissions: [Permission.VIEW_CONTACTS],
            },
          },
        ],
      },
    });

    assert(user);

    const { data: rootPermissions } = await f.grassrootsAPI.GET(
      "/users/user-permissions-for-org",
      {
        body: {
          organizationId: nameToId.get("root") ?? fail(),
          userId: user.id,
        },
      },
    );

    assert(rootPermissions);
    expect(rootPermissions.permissions).toEqual(2);
  });
});
