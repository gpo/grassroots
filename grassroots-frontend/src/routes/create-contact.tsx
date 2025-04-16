import { createFileRoute } from "@tanstack/react-router";
import { JSX, useCallback, useState } from "react";

import { grassrootsAPI } from "../grassrootsAPI";

import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import { FormField } from "../components/form_field";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import {
  ContactEntityOutDTO,
  PendingContactInDto,
} from "../grassroots-shared/contact.dto.entity";
import { Contacts } from "../components/contacts";

export const Route = createFileRoute("/create-contact")({
  component: NewContact,
});

function NewContact(): JSX.Element {
  const [previouslyCreatedContacts, setPreviouslyCreatedContacts] = useState<
    ContactEntityOutDTO[]
  >([]);

  const form = useForm<PendingContactInDto>({
    resolver: classValidatorResolver(PendingContactInDto),
    mode: "onBlur",
  });

  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: async (contact: PendingContactInDto) => {
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

  const onSubmit: SubmitHandler<PendingContactInDto> = useCallback(
    async (data) => {
      const contact: ContactEntityOutDTO = await mutateAsync(data);
      setPreviouslyCreatedContacts((contacts: ContactEntityOutDTO[]) => [
        ...contacts,
        contact,
      ]);
      form.reset();
    },
    [],
  );

  return (
    <>
      {/*TODO: re-enable <SessionAuth>*/}
      <FormProvider {...form}>
        {/* This little typescript dance is required to make eslint happy.  */}
        <form onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}>
          <FormField field="firstName" label="First Name"></FormField>
          <FormField field="lastName" label="Last Name"></FormField>
          <FormField field="email" label="Email"></FormField>
          <input type="submit" />
        </form>
      </FormProvider>

      {previouslyCreatedContacts.length == 0 ? <></> : <h2>Created</h2>}
      <Contacts contacts={previouslyCreatedContacts}></Contacts>
      {/*</SessionAuth>*/}
    </>
  );
}
