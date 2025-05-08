import { createFileRoute } from "@tanstack/react-router";
import { PaginatedContacts } from "../components/paginated_contacts";
import { JSX, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { useContactSearch } from "../hooks/useContactSearch";
import {
  ContactSearchInDTO,
  PaginatedContactSearchInDTO,
} from "../grassroots-shared/contact.entity.dto";
import { TextField } from "../components/textField";

export const Route = createFileRoute("/search")({
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

  console.log(searchParams);

  const { data: results, error, isLoading } = useContactSearch(searchParams);
  void error;
  void isLoading;

  console.log(results);

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
