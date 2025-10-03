import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { JSX, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { grassrootsAPI } from "../../GrassRootsAPI.js";
import { readFileAsText } from "../../util/ReadFileAsText.js";
import {
  CreatePhoneCanvassDataValidatedDTO,
  CreatePhoneCanvassResponseDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { classValidatorResolver } from "../../util/ClassValidatorResolver.js";
import { FileInput, TextInput } from "@mantine/core";
import { useTypedForm } from "../../util/UseTypedForm.js";
import { FieldErrors } from "react-hook-form";

export const Route = createFileRoute("/PhoneCanvass/Create")({
  component: CreatePhoneCanvass,
});

class CreatePhoneCanvassData extends CreatePhoneCanvassDataValidatedDTO {
  csv!: File | undefined;
}

function CreatePhoneCanvass(): JSX.Element {
  const navigate = useNavigate();

  const form = useTypedForm<CreatePhoneCanvassData>({
    validate: classValidatorResolver(CreatePhoneCanvassData, (values) => {
      const errors: FieldErrors = {};
      if (values.csv === undefined) {
        Object.assign(errors, { csv: "Missing csv" });
      }
      return {};
    }),
    initialValues: CreatePhoneCanvassData.from({
      csv: undefined,
      name: "",
    }),
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

  const onSubmit = useCallback(async (data: CreatePhoneCanvassData) => {
    if (!data.csv) {
      throw new Error("Form submitted without csv present.");
    }

    const result = await mutateAsync(data);
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
