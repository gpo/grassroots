import { IsNotEmpty } from "class-validator";
import { createDTOBase } from "../util/CreateDTOBase.js";

import "reflect-metadata";

export class HelloOutDTO extends createDTOBase("HelloOut") {
  @IsNotEmpty()
  message!: string;
}
