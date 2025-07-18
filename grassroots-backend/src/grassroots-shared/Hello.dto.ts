import { createDTOBase } from "./util/CreateDTOBase";

export class HelloOutDTO extends createDTOBase("HelloOut") {
  message!: string;
}
