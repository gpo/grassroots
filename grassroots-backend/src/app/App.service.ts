import { Injectable } from "@nestjs/common";
import { HelloOutDTO } from "../grassroots-shared/Hello.dto.js";

@Injectable()
export class AppService {
  getHello(): HelloOutDTO {
    return HelloOutDTO.from({ message: "Hello World!" });
  }
}
