import { TextInput, TextInputProps } from "@mantine/core";
import { JSX } from "react";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";

// Inspired by https://github.com/aranlucas/react-hook-form-mantine/blob/master/src/TextInput/TextInput.tsx

// Default value is optional in the extended types, but if you leave it out, react-form-hooks gets confused
// when used in this way. Explicitly make it required.
export type TextFieldProps<T extends FieldValues> = Omit<
  UseControllerProps<T>,
  "defaultValue"
> &
  Required<Pick<UseControllerProps<T>, "defaultValue">> &
  Omit<TextInputProps, "value" | "defaultValue">;

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
    <>
      <TextInput
        value={value}
        onChange={(v) => {
          onChange(v.target.value);
        }}
        label={props.label}
        error={fieldState.error?.message}
        {...field}
      ></TextInput>
    </>
  );
}
