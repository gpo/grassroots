import { useE2ETestFixture } from "../src/testing/e2eSetup";
import { AppService } from "../src/app.service";
import { AppController } from "../src/app.controller";

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
});
