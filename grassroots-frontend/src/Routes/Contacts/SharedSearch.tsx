import { createFileRoute } from "@tanstack/react-router";
import { JSX, useState } from "react";
import { PaginatedContacts } from "../../Features/Contacts/Components/PaginatedContacts.js";
import {
  ContactSearchRequestDTO,
  PaginatedContactResponseDTO,
  PaginatedContactSearchRequestDTO,
} from "grassroots-shared/dtos/Contact.dto";
import { cast } from "grassroots-shared/util/Cast";
import { useContactSearch } from "../../Features/Contacts/Logic/UseContactSearch.js";

export const Route = createFileRoute("/Contacts/SharedSearch")({
  component: SharedSearch,
  validateSearch: (
    search: Record<string, unknown>,
  ): ContactSearchRequestDTO => {
    return cast(ContactSearchRequestDTO, search);
  },
});

const ROWS_PER_PAGE = 10;

function SharedSearch(): JSX.Element {
  const search = Route.useSearch();
  const [rowsToSkip, setRowsToSkip] = useState<number>(0);

  let { data: paginatedContactResponse } = useContactSearch(
    PaginatedContactSearchRequestDTO.from({
      contact: search,
      paginated: {
        rowsToSkip,
        rowsToTake: ROWS_PER_PAGE,
      },
    }),
  );
  paginatedContactResponse =
    paginatedContactResponse ?? PaginatedContactResponseDTO.empty();
  return (
    <PaginatedContacts
      paginatedContactResponse={paginatedContactResponse}
      setRowsToSkip={setRowsToSkip}
      rowsPerPage={ROWS_PER_PAGE}
    ></PaginatedContacts>
  );
}
