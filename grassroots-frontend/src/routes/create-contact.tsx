import { createFileRoute } from "@tanstack/react-router";
import { JSX, useCallback } from "react";

import { TextInput } from "@mantine/core";
import { CreateContactInDto } from "../grassroots-shared/contact.entity.dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { grassrootsAPI } from "../grassRootsAPI";

export const Route = createFileRoute("/create-contact")({
  component: CreateContact,
});

function CreateContact(): JSX.Element {
  // TODO: enable input validation.
  const form =
    useForm<CreateContactInDto>(/*{
    resolver: classValidatorResolver(PendingContactInDto),
    mode: "onBlur",
  }*/);

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
        <TextInput
          id="firstName"
          label="First Name"
          {...form.register("firstName")}
        ></TextInput>
        <TextInput label="Last Name" {...form.register("lastName")}></TextInput>
        <TextInput label="Email" {...form.register("email")}></TextInput>
        <TextInput
          label="Phone Number"
          {...form.register("phoneNumber")}
        ></TextInput>
        <input type="submit" />
      </form>
    </FormProvider>
  );
}
