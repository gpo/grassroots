import { AppModule } from "grassroots-backend/app/App.module";
import { useE2ETestFixture } from "./infra/E2eSetup.js";
import { describe, expect, it } from "vitest";

describe("AppController (e2e)", () => {
  const getFixture = useE2ETestFixture({
    imports: [AppModule],
  });

  it("/ (GET)", async () => {
    const f = getFixture();

    const result = await f.grassrootsAPI.GET("/");
    expect(result.response.status).toBe(200);
    expect(result.data?.message).toBe("Hello World!");
  });
});
