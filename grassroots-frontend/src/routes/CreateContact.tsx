import { createFileRoute } from "@tanstack/react-router";
import { JSX, useCallback } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { grassrootsAPI } from "../GrassRootsAPI";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { TextField } from "../components/TextField";
import { CreateContactRequestDto } from "../grassroots-shared/Contact.dto";

export const Route = createFileRoute("/CreateContact")({
  component: CreateContact,
});

const TextFieldMakeContact = TextField<CreateContactRequestDto>;

function CreateContact(): JSX.Element {
  const form = useForm<CreateContactRequestDto>({
    resolver: classValidatorResolver(CreateContactRequestDto),
    mode: "onBlur",
  });

  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: async (contact: CreateContactRequestDto) => {
      const result = await grassrootsAPI.POST("/contacts", {
        body: contact,
      });
      if (!result.data) {
        throw new Error("Failed to create contact.");
      }
      return result.data;
    },
    retry: 1,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });

  const onSubmit: SubmitHandler<CreateContactRequestDto> = useCallback(
    async (data) => {
      await mutateAsync(data);
      form.reset();
    },
    [],
  );

  return (
    <FormProvider {...form}>
      {/* This little typescript dance is required to make eslint happy.  */}
      <form onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}>
        <TextFieldMakeContact
          defaultValue=""
          label="First Name"
          name="firstName"
        ></TextFieldMakeContact>
        <TextFieldMakeContact
          defaultValue=""
          label="Last Name"
          name="lastName"
        ></TextFieldMakeContact>
        <TextFieldMakeContact
          defaultValue=""
          label="Email"
          name="email"
        ></TextFieldMakeContact>
        <TextFieldMakeContact
          defaultValue=""
          label="Phone Number"
          name="phoneNumber"
        ></TextFieldMakeContact>
        <input type="submit" disabled={!form.formState.isValid} />
      </form>
    </FormProvider>
  );
}
