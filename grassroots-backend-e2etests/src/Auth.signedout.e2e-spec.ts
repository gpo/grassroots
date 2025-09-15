import { describe, expect, it } from "vitest";
import { useE2ETestFixture } from "./infra/E2eSetup.js";
import { AuthModule } from "grassroots-backend/auth/Auth.module";

describe("AuthController (e2e) while signed out", () => {
  const getFixture = useE2ETestFixture({
    imports: [AuthModule],
  });

  it("Redirects to Google signin", async () => {
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

    expect(response.data?.user).toBe(undefined);
  });
});
