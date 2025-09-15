import { describe, expect, it } from "vitest";
import { GoogleOAuthStrategy } from "../auth/GoogleOAuth.strategy.js";
import { useTestFixture } from "./TestSetup.js";
import { UsersModule } from "../users/Users.module.js";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UsersService } from "../users/Users.service.js";

describe("GoogleOAuthStrategy", () => {
  const getFixture = useTestFixture({
    imports: [UsersModule, ConfigModule],
  });

  function useContext(): {
    strategy: GoogleOAuthStrategy;
    usersService: UsersService;
  } {
    const fixture = getFixture();
    const usersService = fixture.app.get<UsersService>(UsersService);

    return {
      strategy: new GoogleOAuthStrategy(
        fixture.app.get<ConfigService>(ConfigService),
        usersService,
      ),
      usersService,
    };
  }
  it("should create a user", async () => {
    const FAKE_ID = "testID";
    const { strategy, usersService } = useContext();
    const before = await usersService.findOneById(FAKE_ID);
    expect(before).toBe(null);

    await new Promise<void>((resolve) => {
      strategy.validate(
        "foo",
        {
          emails: [],
          provider: "",
          id: FAKE_ID,
          displayName: "",
        },
        (err: Error | null | undefined) => {
          if (err) {
            throw err;
          }
          resolve();
        },
      );
    });

    const after = await usersService.findOneById(FAKE_ID);
    expect(after?.id).toBe(FAKE_ID);
  });
});
