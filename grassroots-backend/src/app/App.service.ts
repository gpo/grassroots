import { Injectable } from "@nestjs/common";
import { HelloOutDTO } from "grassroots-shared";

@Injectable()
export class AppService {
  getHello(): HelloOutDTO {
    return HelloOutDTO.from({ message: "Hello World!" });
  }
}
