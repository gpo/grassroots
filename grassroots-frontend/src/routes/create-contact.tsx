import { createFileRoute } from "@tanstack/react-router";
import { JSX, useCallback } from "react";

import { CreateContactInDto } from "../grassroots-shared/contact.entity.dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { grassrootsAPI } from "../grassRootsAPI";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { TextField } from "../components/textField";

export const Route = createFileRoute("/create-contact")({
  component: CreateContact,
});

const TextFieldMakeContact = TextField<CreateContactInDto>;

function CreateContact(): JSX.Element {
  console.log("RENDER");
  const form = useForm<CreateContactInDto>({
    resolver: classValidatorResolver(CreateContactInDto),
    mode: "onBlur",
  });

  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: async (contact: CreateContactInDto) => {
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

  const onSubmit: SubmitHandler<CreateContactInDto> = useCallback(
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
          label="First Name"
          field="firstName"
        ></TextFieldMakeContact>
        <TextFieldMakeContact
          label="Last Name"
          field="lastName"
        ></TextFieldMakeContact>
        <TextFieldMakeContact
          label="Email"
          field="email"
        ></TextFieldMakeContact>
        <TextFieldMakeContact
          label="Phone Number"
          field="phoneNumber"
        ></TextFieldMakeContact>
        <input type="submit" />
      </form>
    </FormProvider>
  );
}
