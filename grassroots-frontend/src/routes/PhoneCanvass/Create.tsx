import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { JSX, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FieldValues,
  FormProvider,
  ResolverOptions,
  ResolverResult,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { grassrootsAPI } from "../../GrassRootsAPI.js";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { TextField } from "../../components/TextField.js";
import { readFileAsText } from "../../util/ReadFileAsText.js";
import { GRFileInput } from "../../components/GRFileInput.js";
import { propsOf } from "grassroots-shared/util/TypeUtils";
import { CreatePhoneCanvassDataValidatedDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";

export const Route = createFileRoute("/PhoneCanvass/Create")({
  component: CreatePhoneCanvass,
});

class CreatePhoneCanvassData extends CreatePhoneCanvassDataValidatedDTO {
  csv!: File;
}

function isValid<T extends FieldValues>(
  result: ResolverResult<T>,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
): result is { values: T; errors: {} } {
  return Object.keys(result.errors).length === 0;
}

function CreatePhoneCanvass(): JSX.Element {
  const navigate = useNavigate();

  const form = useForm<CreatePhoneCanvassData>({
    resolver: async (data, context, options) => {
      // If we pass classValidatorResolver a File, it explodes.
      // To avoid this, we pull out the files before validation.
      const { csv: csvProps, ...validated } = propsOf(data);
      void csvProps;
      const validatedResult = await classValidatorResolver(
        CreatePhoneCanvassDataValidatedDTO,
      )(
        CreatePhoneCanvassDataValidatedDTO.from(validated),
        context,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        options as unknown as ResolverOptions<CreatePhoneCanvassDataValidatedDTO>,
      );

      const result: ResolverResult<CreatePhoneCanvassData> = validatedResult;
      if (isValid(result)) {
        result.values.csv = data.csv;
      }
      // TODO: handle invalid files.
      return result;
    },
    mode: "onBlur",
  });

  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: async (phoneCanvass: CreatePhoneCanvassData) => {
      const csvText = await readFileAsText(phoneCanvass.csv);

      const result = await grassrootsAPI.POST("/phone-canvass", {
        body: {
          csv: csvText,
          name: phoneCanvass.name,
        },
      });
      if (!result.data) {
        throw new Error("Failed to create phone canvass.");
      }
      return result.data;
    },
    retry: 1,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["canvass"] });
    },
  });

  const onSubmit: SubmitHandler<CreatePhoneCanvassData> = useCallback(
    async (data) => {
      const result = await mutateAsync(data);
      await navigate({
        to: "/PhoneCanvass/Manage/$phoneCanvassId",
        params: { phoneCanvassId: result.id },
      });
    },
    [],
  );

  return (
    <FormProvider {...form}>
      {/* This little typescript dance is required to make eslint happy.  */}
      <form onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}>
        <TextField<{ name: string }>
          defaultValue=""
          label="Phone Canvass Name"
          name="name"
        ></TextField>
        <GRFileInput
          label="Contact List CSV"
          description="CSV from GVote containing list of people to phone"
          placeholder="Contact List CSV"
          accept=".csv"
          name="csv"
        ></GRFileInput>
        <input type="submit" />
      </form>
    </FormProvider>
  );
}
