import { FileInput } from "@mantine/core";
import { JSX } from "react";
import {
  FieldPath,
  FieldValues,
  Path,
  useController,
  FieldPathValue,
} from "react-hook-form";

export interface GRFileInputProps<T extends FieldValues> {
  label: string;
  description: string;
  placeholder: string;
  name: Path<T>;
  accept: string;
  defaultValue?: FieldPathValue<T, FieldPath<T>>;
}

export function GRFileInput<T extends FieldValues>(
  props: GRFileInputProps<T>,
): JSX.Element {
  const {
    field: { value, onChange, ...field },
    fieldState,
  } = useController<T>({
    name: props.name,
    defaultValue: props.defaultValue,
  });

  return (
    <FileInput
      value={value}
      onChange={(v) => {
        onChange(v);
      }}
      label={props.label}
      description={props.description}
      placeholder={props.placeholder}
      error={fieldState.error?.message}
      accept={props.accept}
      clearable
      {...field}
    ></FileInput>
  );
}
