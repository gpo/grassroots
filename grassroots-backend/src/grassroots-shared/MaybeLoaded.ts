import { applyDecorators } from "@nestjs/common";
import { ApiProperty, getSchemaPath } from "@nestjs/swagger";

export type MaybeLoaded<T> = T | undefined | "unloaded";

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function ApiPropertyMaybeLoaded(type: Function): PropertyDecorator {
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

export function getMaybeLoadedOrThrow<T>(x: MaybeLoaded<T>): T | undefined {
  if (x == "unloaded") {
    throw new Error("Tried to get unloaded value");
  }
  return x;
}
