import { IsNotEmpty } from "class-validator";
import { createDTOBase } from "../util/CreateDTOBase.js";

export class HelloOutDTO extends createDTOBase("HelloOut") {
  @IsNotEmpty()
  message!: string;
}
