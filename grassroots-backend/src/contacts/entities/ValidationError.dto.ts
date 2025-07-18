import { createDTOBase } from "../../grassroots-shared/util/CreateDTOBase";

export class ValidationErrorOutDTO extends createDTOBase(
  "ValidationErrorOutDTO",
) {
  statusCode!: number;
  message!: string[];
  error!: string;
}
