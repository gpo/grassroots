import { Injectable } from "@nestjs/common";
import { HelloOutDTO } from "./app/entities/Hello.dto";

@Injectable()
export class AppService {
  getHello(): HelloOutDTO {
    return { message: "Hello World!" };
  }
}
