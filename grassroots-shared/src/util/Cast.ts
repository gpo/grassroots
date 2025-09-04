import { ClassConstructor, plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { PropsOf } from "./TypeUtils.js";

export function cast<T extends object>(
  cls: ClassConstructor<T>,
  plain: PropsOf<T>,
): T {
  const instance = plainToInstance(cls, plain);
  const validationErrors = validateSync(instance);
  if (validationErrors.length > 0) {
    throw new Error(validationErrors.join("\n"));
  }
  return instance;
}
