import { IsNotEmpty } from "class-validator";
import { createDTOBase } from "./util/CreateDTOBase.js";
import { ApiProperty } from "@nestjs/swagger";

export class HelloOutDTO extends createDTOBase("HelloOut") {
  @IsNotEmpty()
  @ApiProperty()
  message!: string;
}
