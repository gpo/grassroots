import { AppService } from "../src/App.service";
import { AppController } from "../src/App.controller";
import { useE2ETestFixture } from "../src/testing/E2eSetup";
import { describe, expect, it } from "vitest";

describe("AppController (e2e)", () => {
  const getFixture = useE2ETestFixture({
    providers: [AppService],
    controllers: [AppController],
  });

  it("/ (GET)", async () => {
    const f = getFixture();

    const result = await f.grassrootsAPI.GET("/");
    expect(result.response.status).toBe(200);
    expect(result.data?.message).toBe("Hello World!");
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
