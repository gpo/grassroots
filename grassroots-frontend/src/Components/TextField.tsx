import { TextInput } from "@mantine/core";
import { HTMLInputTypeAttribute, JSX } from "react";
import {
  FieldPath,
  FieldPathValue,
  FieldValues,
  Path,
  useController,
} from "react-hook-form";

// Inspired by https://github.com/aranlucas/react-hook-form-mantine/blob/master/src/TextInput/TextInput.tsx

export interface TextFieldProps<T extends FieldValues> {
  defaultValue: FieldPathValue<T, FieldPath<T>>;
  label: string;
  name: Path<T>;
  type?: HTMLInputTypeAttribute;
}

export function TextField<T extends FieldValues>(
  props: TextFieldProps<T>,
): JSX.Element {
  const {
    field: { value, onChange, ...field },
    fieldState,
  } = useController<T>({
    name: props.name,
    defaultValue: props.defaultValue,
  });

  return (
    <TextInput
      value={value}
      type={props.type}
      onChange={(v) => {
        onChange(v.target.value);
      }}
      label={props.label}
      error={fieldState.error?.message}
      {...field}
    ></TextInput>
  );
}
