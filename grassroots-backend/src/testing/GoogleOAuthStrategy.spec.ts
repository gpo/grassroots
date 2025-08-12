import { describe, expect, it } from "vitest";
import { GoogleOAuthStrategy } from "../auth/GoogleOAuth.strategy";
import { useTestFixture } from "./Setup";
import { UsersModule } from "../users/Users.module";
import { UsersService } from "../users/Users.service";

describe("GoogleOAuthStrategy", () => {
  const getFixture = useTestFixture({
    imports: [UsersModule],
  });

  function useContext(): {
    strategy: GoogleOAuthStrategy;
    usersService: UsersService;
  } {
    const fixture = getFixture();
    const usersService = fixture.app.get<UsersService>(UsersService);

    return {
      strategy: new GoogleOAuthStrategy(
        usersService,
        "test-client-id",
        "test-client-secret",
        "/auth/google/callback",
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
