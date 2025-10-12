import { useForm, UseFormInput, UseFormReturnType } from "@mantine/form";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useTypedForm<T extends Record<string, any>>(
  input: UseFormInput<T, (values: T) => T>,
): Omit<UseFormReturnType<T>, "key" | "getInputProps"> & {
  key: (field: keyof T & string) => string;
  getInputProps: (
    field: keyof T & string,
  ) => ReturnType<UseFormReturnType<T>["getInputProps"]>;
} {
  const form = useForm<T>(input);
  const result = {
    ...form,
    key: (field: keyof T & string) => form.key(field),
    getInputProps: (field: keyof T & string) => form.getInputProps(field),
  } as const;

  return result;
}
