import { createDTOBase } from "../grassroots-shared/util/CreateDTOBase";

export class ValidationErrorOutDTO extends createDTOBase("ValidationErrorOut") {
  statusCode!: number;
  message!: string[];
  error!: string;
}
