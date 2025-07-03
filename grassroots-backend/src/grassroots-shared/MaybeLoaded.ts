import { Collection } from "@mikro-orm/core";
import { applyDecorators } from "@nestjs/common";
import { ApiProperty, getSchemaPath } from "@nestjs/swagger";

export type MaybeLoaded<T> = T | "unloaded" | undefined;

export interface ApiPropertyMaybeLoadedOptions {
  isArray?: boolean;
}

export function ApiPropertyMaybeLoaded(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  type: Function,
  options?: ApiPropertyMaybeLoadedOptions,
): PropertyDecorator {
  if (options?.isArray === true) {
    return applyDecorators(
      ApiProperty({
        required: false,
        anyOf: [
          { type: "string", enum: ["unloaded"] },
          {
            type: "array",
            items: { $ref: getSchemaPath(type) },
          },
        ],
      }),
    );
  }

  return applyDecorators(
    ApiProperty({
      required: false,
      anyOf: [
        { type: "string", enum: ["unloaded"] },
        { $ref: getSchemaPath(type) },
      ],
    }),
  );
}

export function isLoaded<T>(maybe: MaybeLoaded<T>): maybe is T | undefined {
  return maybe !== "unloaded";
}

export function map<T, G>(
  maybe: MaybeLoaded<T>,
  f: (x: T) => G,
): MaybeLoaded<G> {
  if (!isLoaded(maybe)) {
    return "unloaded";
  }
  if (maybe === undefined) {
    return undefined;
  }
  return f(maybe);
}

export function mapItems<T extends object, G>(
  maybe: MaybeLoaded<Collection<T>>,
  f: (x: T) => G,
): MaybeLoaded<G[]> {
  if (!isLoaded(maybe)) {
    return "unloaded";
  }
  if (maybe === undefined) {
    return undefined;
  }
  return maybe.getItems().map((x) => f(x));
}

export function getOrThrow<T>(x: MaybeLoaded<T>): T | undefined {
  if (!isLoaded(x)) {
    throw new Error("Attempt to get unloaded relation");
  }
  return x;
}
