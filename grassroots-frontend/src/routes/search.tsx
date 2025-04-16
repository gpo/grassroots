import { createFileRoute, Link } from "@tanstack/react-router";
import { PaginatedContacts } from "../components/paginated_contacts";
import { JSX, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FormField } from "../components/form_field";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import {
  ContactSearchInDTO,
  PaginatedContactSearchInDTO,
} from "../grassroots-shared/contact.dto.entity";
import { useContactSearch } from "../hooks/useContactSearch";

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

  return (
    <>
      {/*TODO: re-enable <SessionAuth>*/}
      <FormProvider {...form}>
        <form>
          <FormField
            field="firstName"
            label="First Name"
            emptyAsUndefined
          ></FormField>
          <FormField
            field="lastName"
            label="Last Name"
            emptyAsUndefined
          ></FormField>
          <FormField field="email" label="Email" emptyAsUndefined></FormField>
          <FormField
            field="id"
            label="id"
            emptyAsUndefined
            type="number"
          ></FormField>
        </form>
      </FormProvider>

      <Link role="button" to="/shared-search" search={searchParams.contact}>
        Share Link to Search
      </Link>

      {results ? (
        <PaginatedContacts
          contacts={results.contacts}
          paginated={results.paginated}
          setRowsToSkip={setRowsToSkip}
          rowsPerPage={ROWS_PER_PAGE}
        ></PaginatedContacts>
      ) : (
        <></>
      )}
      {/*</SessionAuth>*/}
    </>
  );
}
