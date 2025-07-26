import { IsInt, Min } from "class-validator";
import { createDTOBase } from "./src/util/CreateDTOBase";

export class PaginatedRequestDTO extends createDTOBase("PaginatedRequest") {
  @IsInt()
  @Min(0)
  rowsToSkip!: number;
  @IsInt()
  @Min(1)
  rowsToTake!: number;
}

export class PaginatedResponseDTO extends createDTOBase("PaginatedResponse") {
  @IsInt()
  @Min(0)
  rowsSkipped!: number;

  @IsInt()
  @Min(0)
  rowsTotal!: number;
}
