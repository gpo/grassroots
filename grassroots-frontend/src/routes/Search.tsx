import { createFileRoute } from "@tanstack/react-router";
import { PaginatedContacts } from "../components/PaginatedContacts";
import { JSX, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useContactSearch } from "../hooks/useContactSearch";
import { TextField } from "../components/TextField";
import { RoutedLink } from "../components/RoutedLink";
import { transformingClassValidatorResolver } from "../TransformingClassValidatorResolver";
import {
  ContactSearchRequestDTO,
  PaginatedContactSearchRequestDTO,
} from "@grassroots/shared";

export const Route = createFileRoute("/Search")({
  component: Search,
});

const ROWS_PER_PAGE = 10;

function Search(): JSX.Element {
  const form = useForm<ContactSearchRequestDTO>({
    resolver: transformingClassValidatorResolver(
      ContactSearchRequestDTO,
      {},
      { mode: "sync" },
    ),
    mode: "onChange",
  });

  const [rowsToSkip, setRowsToSkip] = useState<number>(0);

  const searchParams = PaginatedContactSearchRequestDTO.from({
    contact: form.watch(),
    paginated: {
      rowsToSkip,
      rowsToTake: ROWS_PER_PAGE,
    },
  });

  const useContactSearchResults = useContactSearch(searchParams).data;

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
          <TextField
            name="id"
            label="id"
            type="number"
            defaultValue=""
          ></TextField>
        </form>
      </FormProvider>

      <RoutedLink to="/SharedSearch" search={searchParams.contact}>
        Share Link to Search
      </RoutedLink>

      <PaginatedContacts
        paginatedContactResponse={useContactSearchResults}
        setRowsToSkip={setRowsToSkip}
        rowsPerPage={ROWS_PER_PAGE}
      ></PaginatedContacts>
    </>
  );
}
