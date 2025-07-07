import { describe, expect, it } from "vitest";
import { useE2ETestFixture } from "../testing/E2eSetup";
import { AuthModule } from "./Auth.module";
import { UsersModule } from "../users/Users.module";
import { MOCK_AUTH_GUARD_USER } from "../testing/MockAuthGuard";

describe("AuthController (e2e) while signed in", () => {
  const getFixture = useE2ETestFixture({
    imports: [AuthModule, UsersModule],
    overrideAuthGuard: true,
  });

  it("Provides info on a logged in user", async () => {
    const f = getFixture();
    const response = await f.grassrootsAPI.GET(
      "/auth/example_route_using_user",
    );

    expect(response.data?.user?.id).toBe(MOCK_AUTH_GUARD_USER.id);
  });
});
