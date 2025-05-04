import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { HelloOutDTO } from "./app/entities/hello.dto";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): HelloOutDTO {
    return this.appService.getHello();
  }
}
