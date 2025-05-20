import { ClassConstructor, plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";

// Needs to be imported somewhere for `enableImplicitConversion` to work.
import "reflect-metadata";

// Roughly, given a class, gives you an interface with its attributes.
export type PropsOf<T> = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

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
