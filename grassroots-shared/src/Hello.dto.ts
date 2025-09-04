import { createDTOBase } from "./util/CreateDTOBase.js";

export class HelloOutDTO extends createDTOBase("HelloOut") {
  message!: string;
}
