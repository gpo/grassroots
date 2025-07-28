import { createDTOBase } from "@grassroots/shared";

export class ValidationErrorOutDTO extends createDTOBase("ValidationErrorOut") {
  statusCode!: number;
  message!: string[];
  error!: string;
}
