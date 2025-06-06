import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./Auth.service";
import { UsersService } from "../users/Users.service";
import { beforeEach, describe, expect, it } from "vitest";

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, UsersService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
