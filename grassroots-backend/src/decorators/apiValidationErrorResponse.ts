import { applyDecorators, Type } from "@nestjs/common";
import { ApiOkResponse, ApiResponse } from "@nestjs/swagger";

export function ApiResponseWithValidation(
  type: Type<unknown>,
): <T>(
  target: object,
  propertyKey?: string | symbol,
  descriptor?: TypedPropertyDescriptor<T>,
) => void {
  return applyDecorators(
    ApiOkResponse({ type }),
    ApiResponse({
      status: 401,
      description: "Validation failed",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number" },
          message: {
            type: "array",
            items: { type: "string" },
          },
          error: { type: "string" },
        },
      },
    }),
  );
}
