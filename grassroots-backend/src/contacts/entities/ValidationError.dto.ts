import { createDTOBase } from "../../grassroots-shared/util/CreateDTOBase.js";

export class ValidationErrorOutDTO extends createDTOBase("ValidationErrorOut") {
  statusCode!: number;
  message!: string[];
  error!: string;
}
