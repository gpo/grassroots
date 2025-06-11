import { describe, expect, it } from "vitest";
import { GoogleOAuthStrategy } from "../auth/GoogleOAuth.strategy";
import { useTestFixture } from "./Setup";
import { UsersModule } from "../users/Users.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UsersService } from "../users/Users.service";

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
    const FAKE_EMAIL = "test@test.com";
    const { strategy, usersService } = useContext();
    const before = await usersService.findOne({ email: FAKE_EMAIL });
    expect(before).toBe(null);

    strategy.validate(
      "foo",
      {
        emails: [{ value: FAKE_EMAIL }],
        provider: "",
        id: "",
        displayName: "",
      },
      (err: Error | null | undefined) => {
        if (err) {
          throw err;
        }
      },
    );
    const after = await usersService.findOne({ email: FAKE_EMAIL });
    expect(after?.email).toBe(FAKE_EMAIL);
  });
});
