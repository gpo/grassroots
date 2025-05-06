import { OpenAPIObject } from "@nestjs/swagger";
import { ValidationErrorOutDTO } from "./contacts/entities/validationError.dto";

export function addValidationErrorsToOpenAPI(
  openAPI: OpenAPIObject,
): OpenAPIObject {
  for (const pathItem of Object.values(openAPI.paths)) {
    const operations: (typeof pathItem.get)[] = [
      pathItem.get,
      pathItem.put,
      pathItem.post,
      pathItem.delete,
      pathItem.options,
      pathItem.head,
      pathItem.patch,
      pathItem.trace,
    ];
    for (const operation of operations) {
      if (!operation) {
        continue;
      }
      operation.responses["401"] = {
        description: "Validation failed",
        content: {
          "application/json": {
            schema: {
              $ref: `#/components/schemas/${ValidationErrorOutDTO.name}`,
            },
          },
        },
      };
    }
  }
  return openAPI;
}
