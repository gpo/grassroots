import { AppService } from "../src/App.service";
import { useE2ETestFixture } from "../src/testing/E2eSetup";
import { AuthController } from "../src/auth/Auth.controller";

describe("AuthController (e2e)", () => {
  const getFixture = useE2ETestFixture({
    providers: [AppService],
    controllers: [AuthController],
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
