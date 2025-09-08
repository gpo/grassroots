import { Test, TestingModuleBuilder } from "@nestjs/testing";
import { AppService } from "./App.service.js";
import { AppController } from "./App.controller.js";
import { beforeEach, describe, expect, it } from "vitest";

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const builder: TestingModuleBuilder = Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    });
    const app = await builder.compile();
    appController = app.get<AppController>(AppController);
  });

  describe("root", () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello().message).toBe("Hello World!");
    });
  });
});
