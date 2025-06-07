import { useE2ETestFixture } from "../src/testing/E2eSetup";
import { describe, expect, it } from "vitest";
import { AppModule } from "../src/App.module";
import { AuthModule } from "../src/auth/Auth.module";

describe("AuthController (e2e)", () => {
  const getFixture = useE2ETestFixture({
    imports: [AppModule, AuthModule],
  });

  // TODO: update once we actually verify credentials.
  it("allows login", async () => {
    const f = getFixture();

    const result = await f.grassrootsAPI.POST("/auth/login", {
      body: {
        email: "test@test.com",
        password: "foo",
      },
    });
    expect(result.response.headers.get("set-cookie")).not.toBeNull();
    expect(result.response.status).toBe(201);
    expect(result.data?.email).toBe("test@test.com");
  });
});
