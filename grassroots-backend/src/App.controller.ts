import { Controller, Get } from "@nestjs/common";
import { AppService } from "./App.service";
import { HelloOutDTO } from "./app/entities/Hello.dto";
import { PublicRoute } from "./auth/PublicRoute.decorator";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @PublicRoute()
  getHello(): HelloOutDTO {
    return this.appService.getHello();
  }
}
