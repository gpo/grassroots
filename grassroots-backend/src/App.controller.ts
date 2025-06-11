import { Controller, Get } from "@nestjs/common";
import { AppService } from "./App.service";
import { HelloOutDTO } from "./app/entities/Hello.dto";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): HelloOutDTO {
    return this.appService.getHello();
  }
}
