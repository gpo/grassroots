import { applyDecorators } from "@nestjs/common";
import { ApiProperty, getSchemaPath } from "@nestjs/swagger";

export type MaybeLoaded<T> = T | undefined | "unloaded";

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

export function getMaybeLoadedOrThrow<T>(x: MaybeLoaded<T>): T | undefined {
  if (x == "unloaded") {
    throw new Error("Tried to get unloaded value");
  }
  return x;
}
