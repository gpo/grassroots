import { createDTOBase } from "../util/CreateDTOBase.js";

export class ValidationErrorOutDTO extends createDTOBase("ValidationErrorOut") {
  statusCode!: number;
  message!: string[];
  error!: string;
}
