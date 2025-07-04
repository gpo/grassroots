import { BaseEntity, Collection } from "@mikro-orm/core";
import { MaybeLoaded } from "../grassroots-shared/MaybeLoaded";
import { applyDecorators } from "@nestjs/common";
import { ApiProperty, getSchemaPath } from "@nestjs/swagger";

export function toMaybeLoaded<
  K extends object,
  T extends BaseEntity | Collection<K>,
>(x: T | undefined): MaybeLoaded<T> {
  if (x === undefined) {
    return undefined;
  }
  return x.isInitialized() ? x : "unloaded";
}

export interface ApiPropertyMaybeLoadedOptions {
  isArray?: boolean;
}

export function PropertyDecorator(
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
