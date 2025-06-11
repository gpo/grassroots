import { describe, expect, it } from "vitest";
import { useE2ETestFixture } from "../src/testing/E2eSetup";
import { AuthModule } from "../src/auth/Auth.module";
import { UsersModule } from "../src/users/Users.module";
import { MOCK_AUTH_GUARD_USER } from "./MockAuthGuard";

describe("AuthController (e2e) while signed out", () => {
  const getFixture = useE2ETestFixture({
    imports: [AuthModule],
  });

  it("Redirects to Google signing", async () => {
    const f = getFixture();
    const response = await f.grassrootsAPIRaw("/auth/login", {
      redirect: "manual",
    });

    expect(response.status).toBe(302);
    const REDIRECT_REGEX =
      /https:\/\/accounts.google.com\/o\/oauth2\/v2\/auth.*/;
    expect(response.headers.get("Location")).toMatch(REDIRECT_REGEX);
  });

  it("Knows a signed out user is signed out", async () => {
    const f = getFixture();

    const response = await f.grassrootsAPI.GET("/auth/is_authenticated");

    expect(response.data?.isLoggedIn).toBe(false);
    expect(response.data?.user).toBe(undefined);
  });
});

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

    expect(response.data?.isLoggedIn).toBe(true);
    expect(response.data?.user?.email).toBe(MOCK_AUTH_GUARD_USER.email);
  });
});
