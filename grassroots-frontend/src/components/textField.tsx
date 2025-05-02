import { TextInput, TextInputProps } from "@mantine/core";
import { JSX } from "react";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";

// Inspired by https://github.com/aranlucas/react-hook-form-mantine/blob/master/src/TextInput/TextInput.tsx
export type TextFieldProps<T extends FieldValues> = Omit<
  UseControllerProps<T>,
  "defaultValue"
> &
  Required<Pick<UseControllerProps<T>, "defaultValue">> &
  Omit<TextInputProps, "value" | "defaultValue"> & {
    emptyAsUndefined?: boolean;
  };

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

  const mapValue = !props.emptyAsUndefined
    ? (x: string): string => x
    : (value: string): string | undefined => {
        return value === "" ? undefined : value;
      };

  return (
    <>
      <TextInput
        value={value}
        onChange={(v) => {
          onChange(mapValue(v.target.value));
        }}
        label={props.label}
        error={fieldState.error?.message}
        {...field}
      ></TextInput>
    </>
  );
}
