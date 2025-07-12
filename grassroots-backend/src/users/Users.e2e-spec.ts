import { describe, expect, it } from "vitest";
import { useE2ETestFixture } from "../testing/E2eSetup";
import { UsersModule } from "./Users.module";
import { createOrganizationTree } from "../testing/testHelpers/CreateOrganizationTree";
import { Permission } from "../grassroots-shared/Permission";
import { fail } from "../grassroots-shared/util/Fail";
import { OrganizationsModule } from "../organizations/Organizations.module";
import { fetchSuccessOrThrow } from "../grassroots-shared/util/FetchSuccessOrThrow";

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

    console.log(nameToId);

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
              inherited: false,
              organizationId: nameToId.get("B") ?? fail(),
              role: {
                permissions: [Permission.VIEW_CONTACTS],
              },
            },
          ],
        },
      }),
    );

    console.log("About to get permissions", nameToId.get("root") ?? fail());
    console.log(
      "About to get permissions",
      typeof (nameToId.get("root") ?? fail()),
    );

    const rootPermissions = fetchSuccessOrThrow(
      await f.grassrootsAPI.GET("/users/user-permissions-for-org", {
        params: {
          query: {
            organizationId: nameToId.get("root") ?? fail(),
            userId: user.id,
          },
        },
      }),
    );

    expect(rootPermissions.permissions).toEqual([
      Permission.VIEW_CONTACTS,
    ] satisfies Permission[]);
  });
});
