import { createFileRoute } from "@tanstack/react-router";
import { PaginatedContacts } from "../../Features/Contacts/Components/PaginatedContacts.js";
import { JSX, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { TextField } from "../../Components/TextField.js";
import { RoutedLink } from "../../Components/RoutedLink.js";
import { transformingClassValidatorResolver } from "../../TransformingClassValidatorResolver.js";
import {
  ContactSearchRequestDTO,
  PaginatedContactResponseDTO,
  PaginatedContactSearchRequestDTO,
} from "grassroots-shared/dtos/Contact.dto";
import { useContactSearch } from "../../Features/Contacts/Logic/UseContactSearch.js";

export const Route = createFileRoute("/Contacts/Search")({
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

  const useContactSearchResults =
    useContactSearch(searchParams).data ?? PaginatedContactResponseDTO.empty();

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

      <RoutedLink to="/Contacts/SharedSearch" search={searchParams.contact}>
        Share Link to Search
      </RoutedLink>

      <PaginatedContacts
        paginatedContactResponse={useContactSearchResults}
        setRowsToSkip={setRowsToSkip}
        rowsPerPage={ROWS_PER_PAGE}
        phoneCanvassId={"TODO"}
      ></PaginatedContacts>
    </>
  );
}
