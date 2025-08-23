import { describe, expect, it } from "vitest";
import { useE2ETestFixture } from "../testing/E2eSetup";
import { AuthModule } from "./Auth.module";
import { UsersModule } from "../users/Users.module";
import { MOCK_AUTH_GUARD_USER } from "../testing/MockAuthGuard";
import { LoginStateDTO } from "../grassroots-shared/LoginState.dto";

describe("AuthController (e2e) while signed in", () => {
  const getFixture = useE2ETestFixture({
    imports: [AuthModule, UsersModule],
    overrideAuthGuard: true,
  });

  it("Provides info on a logged in user", async () => {
    const f = getFixture();

    // Test the is_authenticated endpoint instead of login
    const response = LoginStateDTO.fromFetchOrThrow(
      await f.grassrootsAPIRaw("/auth/is_authenticated", {
        method: "GET",
      }),
    );

    expect(response.user?.id).toBe(MOCK_AUTH_GUARD_USER.id);
  });

  it("Login endpoint accepts redirect_path parameter", async () => {
    const f = getFixture();

    // Test that login endpoint accepts the redirect_path (returns VoidDTO)
    const response = await f.grassrootsAPIRaw("/auth/login", {
      method: "GET",
      query: { redirect_path: "http://grassroots.org/test-redirect" },
    });

    // Should return 200 OK (will redirect to OAuth in real scenario)
    expect(response.status).toBe(200);
  });
});
