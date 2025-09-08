import { useE2ETestFixture } from "../testing/E2eSetup.js";
import { describe, expect, it } from "vitest";
import { AppModule } from "./App.module.js";

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
