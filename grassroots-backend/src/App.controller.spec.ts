import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./App.controller";
import { AppService } from "./App.service";
import { AuthService } from "./auth/Auth.service";
import { UsersService } from "./users/Users.service";

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, AuthService, UsersService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("root", () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello().message).toBe("Hello World!");
    });
  });
});
