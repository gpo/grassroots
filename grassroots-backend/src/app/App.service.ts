import { Injectable } from "@nestjs/common";
import { HelloOutDTO } from "../grassroots-shared/Hello.dto";

@Injectable()
export class AppService {
  getHello(): HelloOutDTO {
    return { message: "Hello World!" };
  }
}
