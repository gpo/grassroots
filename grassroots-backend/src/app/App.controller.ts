import { Controller, Get } from "@nestjs/common";
import { AppService } from "./App.service.js";
import { HelloOutDTO } from "../grassroots-shared/Hello.dto.js";
import { PublicRoute } from "../auth/PublicRoute.decorator.js";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @PublicRoute()
  getHello(): HelloOutDTO {
    return this.appService.getHello();
  }
}
