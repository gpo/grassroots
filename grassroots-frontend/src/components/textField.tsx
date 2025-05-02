import { TextInput } from "@mantine/core";
import { HTMLInputTypeAttribute, JSX } from "react";
import {
  FieldValues,
  Path,
  useController,
  useFormContext,
} from "react-hook-form";

interface FormFieldProps<T extends FieldValues> {
  label: string;
  field: Path<T>;
  emptyAsUndefined?: boolean;
  type?: HTMLInputTypeAttribute;
}

export function TextField<T extends FieldValues>(
  props: FormFieldProps<T>,
): JSX.Element {
  // TODO: remove this.
  const form = useFormContext<T>();

  const {
    field: { value, onChange, ...field },
    fieldState,
  } = useController<T>({
    name: props.field,
    control: form.control,
  });

  const setValueAs = !props.emptyAsUndefined
    ? undefined
    : (value: unknown): unknown => {
        return value === "" ? undefined : value;
      };

  console.log(fieldState);
  return (
    <>
      <TextInput
        value={value}
        onChange={onChange}
        label={props.label}
        error={fieldState.error?.message}
        {...(form.register(props.field), setValueAs)}
        {...field}
      ></TextInput>
    </>
  );
}
