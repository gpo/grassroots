import { describe, expect, it } from "vitest";
import { LoginStateDTO } from "grassroots-shared/dtos/LoginState.dto";
import { OrganizationDTO } from "grassroots-shared/dtos/Organization.dto";
import { fail } from "grassroots-shared/util/Fail";
import { AuthModule } from "grassroots-backend/auth/Auth.module";
import { MOCK_AUTH_GUARD_USER } from "grassroots-backend/testing/MockAuthGuard";
import { UsersModule } from "grassroots-backend/users/Users.module";
import { useE2ETestFixture } from "./infra/E2eSetup.js";
import { createOrganizationTree } from "grassroots-shared-net/devtools/CreateOrganizationTree";

describe("AuthController (e2e) while signed in", () => {
  const getFixture = useE2ETestFixture({
    imports: [AuthModule, UsersModule],
    overrideAuthGuard: true,
  });

  it("Provides info on a logged in user", async () => {
    const f = getFixture();
    const response = LoginStateDTO.fromFetchOrThrow(
      await f.grassrootsAPI.GET("/auth/example_route_using_user"),
    );

    expect(response.user?.id).toBe(MOCK_AUTH_GUARD_USER.id);
  });

  it("Allows setting the active organization", async () => {
    const f = getFixture();

    const { nameToId } = await createOrganizationTree(f.grassrootsAPI, {
      name: "root",
    });
    const rootOrganizationId =
      nameToId.get("root") ?? fail("Missing root organization.");

    const beforeSet = await f.grassrootsAPI.GET("/auth/active-org");
    expect(beforeSet.response.status).toBe(404);

    const { response } = await f.grassrootsAPI.POST("/auth/set-active-org", {
      body: { id: rootOrganizationId },
    });

    const afterSetOrganization = OrganizationDTO.fromFetchOrThrow(
      await f.grassrootsAPI.GET("/auth/active-org", {
        headers: {
          Cookie: response.headers.getSetCookie(),
        },
      }),
    );

    expect(afterSetOrganization.id).toBe(rootOrganizationId);
  });
});
