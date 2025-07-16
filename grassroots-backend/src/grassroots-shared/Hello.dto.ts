import { createDTOBase } from "./util/CreateDTOBase";

export class HelloOutDTO extends createDTOBase<"HelloOutDTO">() {
  message!: string;
}
