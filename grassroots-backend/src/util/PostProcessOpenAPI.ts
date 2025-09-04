import { getSchemaPath, OpenAPIObject } from "@nestjs/swagger";
import { OperationObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import { ValidationErrorOutDTO } from "grassroots-shared/ValidationError.dto";

function mapOperations(
  openAPI: OpenAPIObject,
  f: (operation: OperationObject, path?: string) => void,
): void {
  for (const [path, pathItem] of Object.entries(openAPI.paths)) {
    const operations: (OperationObject | undefined)[] = [
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
      if (operation) {
        f(operation, path);
      }
    }
  }
}

export function addValidationErrorsToOpenAPI(
  openAPI: OpenAPIObject,
): OpenAPIObject {
  mapOperations(openAPI, (operation) => {
    operation.responses["401"] = {
      description: "Validation failed",
      content: {
        "application/json": {
          schema: {
            $ref: getSchemaPath(ValidationErrorOutDTO),
          },
        },
      },
    };
  });
  return openAPI;
}

export function throwOnInvalidType(openAPI: OpenAPIObject): void {
  mapOperations(openAPI, (operation, path) => {
    for (const [responseCode, response] of Object.entries(
      operation.responses,
    )) {
      if (!response) {
        continue;
      }
      if ("content" in response) {
        const contentObject = response.content
          ? response.content["application/json"]
          : undefined;
        const schema = contentObject?.schema;
        if (!schema || !("type" in schema)) {
          continue;
        }

        if (schema.type == "object")
          throw new Error(
            `No type provided for ${path ?? ""} ${responseCode} response ${JSON.stringify(response, null, 2)}`,
          );
      }
    }
  });
}
