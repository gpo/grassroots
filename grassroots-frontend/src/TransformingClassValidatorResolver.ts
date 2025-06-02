// classValidatorResolver doesn't correctly transform its inputs before validation.
// This wrapper performs that transformation and then delegates to the existing classValidatorResolver.

import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import {
  ClassConstructor,
  ClassTransformOptions,
  plainToInstance,
} from "class-transformer";
import { ValidatorOptions } from "class-validator";
import { Resolver } from "react-hook-form";

export function transformingClassValidatorResolver<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Schema extends Record<string, any>,
>(
  schema: ClassConstructor<Schema>,
  schemaOptions?: {
    validator?: ValidatorOptions;
    transformer?: ClassTransformOptions;
  },
  resolverOptions?: {
    mode?: "async" | "sync";
    raw?: boolean;
  },
): Resolver<Schema> {
  return async (values, _, options) => {
    return await classValidatorResolver(schema, schemaOptions, resolverOptions)(
      plainToInstance(schema, values, schemaOptions?.transformer),
      _,
      options,
    );
  };
}
