import { IsInt, Min } from "class-validator";

export class PaginatedInDTO {
  @IsInt()
  @Min(0)
  rowsToSkip!: number;
  @IsInt()
  @Min(1)
  rowsToTake!: number;
}

export class PaginatedOutDTO {
  @IsInt()
  @Min(0)
  rowsSkipped!: number;

  @IsInt()
  @Min(0)
  rowsTotal!: number;
}
