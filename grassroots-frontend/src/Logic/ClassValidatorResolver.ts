import { validateSync, ValidationError } from "class-validator";
import { plainToInstance } from "class-transformer";
import type { ClassConstructor } from "class-transformer";
import type { FormErrors } from "@mantine/form";
import { PropsOf } from "grassroots-shared/util/TypeUtils";

function flattenErrors(
  errors: ValidationError[],
  parentPath?: string,
): FormErrors {
  const formErrors: FormErrors = {};

  for (const err of errors) {
    let path = err.property;
    if (parentPath !== undefined) {
      path = `${parentPath}.${path}`;
    }
    if (err.constraints) {
      formErrors[path] = Object.entries(err.constraints)
        .map(([key, msg]) => `${key}: ${msg}`)
        .join("; ");
    }
    if (err.children && err.children.length > 0) {
      Object.assign(formErrors, flattenErrors(err.children, path));
    }
  }

  return formErrors;
}

export function classValidatorResolver<DTO extends object>(
  dto: ClassConstructor<DTO>,
  additionalValidation?: (values: PropsOf<DTO>) => FormErrors,
): (values: PropsOf<DTO>) => FormErrors {
  const allowedClasses = [File];
  return (values: PropsOf<DTO>): FormErrors => {
    const validate: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(values)) {
      if (!allowedClasses.some((cls) => v instanceof cls)) {
        validate[k] = v;
      }
    }

    const instance = plainToInstance(dto, validate);

    const classValidatorErrors = validateSync(instance, {
      skipMissingProperties: false,
      whitelist: false,
      forbidNonWhitelisted: false,
    });

    const errors = flattenErrors(classValidatorErrors);
    if (additionalValidation) {
      Object.assign(errors, additionalValidation(values));
    }
    console.log(errors);
    return errors;
  };
}
