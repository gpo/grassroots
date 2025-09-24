import { createFileRoute } from "@tanstack/react-router";
import { JSX, useCallback } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { grassrootsAPI } from "../GrassRootsAPI.js";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { TextField } from "../components/TextField.js";
import { CreateContactRequestDTO } from "grassroots-shared/dtos/Contact.dto";
import { ROOT_ORGANIZATION_ID } from "grassroots-shared/dtos/Organization.dto";

export const Route = createFileRoute("/CreateContact")({
  component: CreateContact,
});

const TextFieldMakeContact = TextField<CreateContactRequestDTO>;

function CreateContact(): JSX.Element {
  const form = useForm<CreateContactRequestDTO>({
    resolver: classValidatorResolver(CreateContactRequestDTO),
    mode: "onBlur",
  });

  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: async (contact: CreateContactRequestDTO) => {
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

  const onSubmit: SubmitHandler<CreateContactRequestDTO> = useCallback(
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
        <TextFieldMakeContact
          defaultValue={ROOT_ORGANIZATION_ID}
          label="Organization ID (Temporary)"
          name="organizationId"
        ></TextFieldMakeContact>
        <input type="submit" />
      </form>
    </FormProvider>
  );
}
