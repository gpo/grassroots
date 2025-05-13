import { FindOperator, Like } from "typeorm";

export function LikeOrUndefined(
  s: string | undefined,
): FindOperator<string> | undefined {
  if (s === undefined) {
    return undefined;
  }
  return Like(`%${s}%`);
}
