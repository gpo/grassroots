import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./Users.service";
import { beforeEach, describe, expect, it } from "vitest";

describe("UsersService", () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
