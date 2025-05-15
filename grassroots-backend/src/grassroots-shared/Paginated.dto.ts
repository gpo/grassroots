import { IsInt, Min } from "class-validator";
import { PropsOf } from "./Cast";

export class PaginatedInDTO {
  rowsToSkip: number;
  rowsToTake: number;
  constructor(data: PropsOf<PaginatedInDTO>) {
    this.rowsToSkip = data.rowsToSkip;
    this.rowsToTake = data.rowsToTake;
  }
}

export class PaginatedOutDTO {
  @IsInt()
  @Min(0)
  rowsSkipped: number;

  @IsInt()
  @Min(0)
  rowsTotal: number;

  constructor(data: PropsOf<PaginatedOutDTO>) {
    this.rowsSkipped = data.rowsSkipped;
    this.rowsTotal = data.rowsTotal;
  }
}
