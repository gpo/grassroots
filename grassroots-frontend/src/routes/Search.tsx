import { createFileRoute } from "@tanstack/react-router";
import { PaginatedContacts } from "../components/PaginatedContacts";
import { JSX, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { useContactSearch } from "../hooks/useContactSearch";
import {
  ContactSearchInDTO,
  PaginatedContactSearchInDTO,
} from "../grassroots-shared/Contact.entity.dto";
import { TextField } from "../components/TextField";

export const Route = createFileRoute("/Search")({
  component: Search,
});

const ROWS_PER_PAGE = 10;

function Search(): JSX.Element {
  const form = useForm<ContactSearchInDTO>({
    resolver: classValidatorResolver(ContactSearchInDTO),
    mode: "onChange",
  });

  const [rowsToSkip, setRowsToSkip] = useState<number>(0);

  const searchParams: PaginatedContactSearchInDTO = {
    contact: form.watch(),
    paginated: {
      rowsToSkip,
      rowsToTake: ROWS_PER_PAGE,
    },
  };

  const { data: results } = useContactSearch(searchParams);

  return (
    <>
      <FormProvider {...form}>
        <form>
          <TextField
            name="firstName"
            label="First Name"
            defaultValue=""
          ></TextField>
          <TextField
            name="lastName"
            label="Last Name"
            defaultValue=""
          ></TextField>
          <TextField name="email" label="Email" defaultValue=""></TextField>
          <TextField name="id" label="id" defaultValue=""></TextField>
        </form>
      </FormProvider>

      {results ? (
        <PaginatedContacts
          contacts={results.contacts}
          paginated={results.paginated}
          setRowsToSkip={setRowsToSkip}
          rowsPerPage={ROWS_PER_PAGE}
        ></PaginatedContacts>
      ) : null}
    </>
  );
}
