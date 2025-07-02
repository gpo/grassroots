import { applyDecorators } from "@nestjs/common";
import { ApiProperty, getSchemaPath } from "@nestjs/swagger";

export class MaybeLoaded<T> {
  _value: T | "unloaded" | null = null;

  loaded(): boolean {
    return this._value !== "unloaded";
  }

  get(): T | null {
    if (this._value === "unloaded") {
      throw new Error("Trying to get value which wasn't loaded from the db.");
    }
    return this._value;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function ApiPropertyMaybeLoaded(type: Function): PropertyDecorator {
  return applyDecorators(
    ApiProperty({
      oneOf: [
        {
          properties: {
            value: { type: "string", enum: ["unloaded"] },
          },
        },
        {
          properties: {
            value: { $ref: getSchemaPath(type) },
          },
          required: [],
        },
      ],
    }),
  );
}
