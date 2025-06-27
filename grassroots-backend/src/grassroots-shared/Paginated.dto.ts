import { IsInt, Min } from "class-validator";

export class PaginatedRequestDTO {
  @IsInt()
  @Min(0)
  rowsToSkip!: number;
  @IsInt()
  @Min(1)
  rowsToTake!: number;
}

export class PaginatedResponseDTO {
  @IsInt()
  @Min(0)
  rowsSkipped!: number;

  @IsInt()
  @Min(0)
  rowsTotal!: number;
}
