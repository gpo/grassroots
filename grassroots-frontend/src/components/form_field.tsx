import { ErrorMessage } from "@hookform/error-message";
import { HTMLInputTypeAttribute, JSX } from "react";
import { FieldValues, Path, useFormContext } from "react-hook-form";

interface FormFieldProps<T extends FieldValues> {
  label: string;
  field: Path<T>;
  emptyAsUndefined?: boolean;
  type?: HTMLInputTypeAttribute;
}

// This is obviously not exactly what we'd want, but I think some abstraction here is probably a good idea.
export function FormField<T extends FieldValues>(
  props: FormFieldProps<T>,
): JSX.Element {
  const form = useFormContext();
  const invalid = form.getFieldState(props.field).error?.message ? true : false;
  /*form.formState.touchedFields[props.field] != null &&
    form.formState.errors[props.field] != null;*/
  const setValueAs = !props.emptyAsUndefined
    ? undefined
    : (value: unknown): unknown => {
        return value === "" ? undefined : value;
      };
  return (
    <>
      <label htmlFor={props.field}>{props.label}</label>
      <input
        id={props.field}
        type={props.type}
        {...form.register(props.field, { setValueAs: setValueAs })}
        aria-invalid={invalid}
      />
      <small style={{ height: "1em" }}>
        <ErrorMessage name={props.field} />
      </small>
    </>
  );
}
