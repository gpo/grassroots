import { Controller, Get } from "@nestjs/common";
import { AppService } from "./App.service";
import { HelloOutDTO } from "./app/entities/Hello.dto";
import { AuthService } from "./auth/Auth.service";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService,
  ) {}

  @Get()
  getHello(): HelloOutDTO {
    return this.appService.getHello();
  }
}
