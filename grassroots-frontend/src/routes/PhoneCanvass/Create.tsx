import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { JSX, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { grassrootsAPI } from "../../GrassRootsAPI.js";
import { readFileAsText } from "../../util/ReadFileAsText.js";
import {
  CreatePhoneCanvassDataValidatedDTO,
  CreatePhoneCanvassResponseDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { useForm, UseFormInput, UseFormReturnType } from "@mantine/form";
import { classValidatorResolver } from "../../util/ClassValidatorResolver.js";
import { FileInput, TextInput } from "@mantine/core";
import { PropsOf } from "grassroots-shared/util/TypeUtils";

export const Route = createFileRoute("/PhoneCanvass/Create")({
  component: CreatePhoneCanvass,
});

class CreatePhoneCanvassData extends CreatePhoneCanvassDataValidatedDTO {
  // TODO: can this be undefined?
  csv!: File | null;

  constructor(x: CreatePhoneCanvassDataValidatedDTO, csv: File) {
    super();
    Object.assign(this, x);
    this.csv = csv;
  }
}

type FormData = PropsOf<CreatePhoneCanvassData, File | null>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useTypedForm<T extends Record<string, any>>(
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

function CreatePhoneCanvass(): JSX.Element {
  const navigate = useNavigate();

  const form = useTypedForm<FormData>({
    validate: classValidatorResolver(CreatePhoneCanvassData),
    initialValues: {
      csv: null,
      name: "",
    } as const,
  });

  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: async (phoneCanvass: CreatePhoneCanvassData) => {
      if (!phoneCanvass.csv) {
        throw new Error("Form submitted without csv present.");
      }
      const csvText = await readFileAsText(phoneCanvass.csv);

      return CreatePhoneCanvassResponseDTO.fromFetchOrThrow(
        await grassrootsAPI.POST("/phone-canvass", {
          body: {
            csv: csvText,
            name: phoneCanvass.name,
          },
        }),
      );
    },
    retry: 1,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["canvass"] });
    },
  });

  const onSubmit = useCallback(async (data: FormData) => {
    if (!data.csv) {
      throw new Error("Form submitted without csv present.");
    }
    const dto = new CreatePhoneCanvassData(
      CreatePhoneCanvassDataValidatedDTO.from(data),
      data.csv,
    );

    const result = await mutateAsync(dto);
    await navigate({
      to: "/PhoneCanvass/Manage/$phoneCanvassId",
      params: { phoneCanvassId: result.id },
    });
  }, []);

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <TextInput
        label="Phone Canvass Name"
        key={form.key("name")}
        {...form.getInputProps("name")}
      ></TextInput>
      <FileInput
        label="Contact List CSV"
        description="CSV from GVote containing list of people to phone"
        placeholder="Contact List CSV"
        accept=".csv"
        key={form.key("csv")}
        {...form.getInputProps("csv")}
      ></FileInput>
      <input type="submit" />
    </form>
  );
}
