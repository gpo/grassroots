import { createFileRoute } from "@tanstack/react-router";
import { JSX, useState } from "react";
import { useContactSearch } from "../hooks/useContactSearch.js";
import { PaginatedContacts } from "../components/PaginatedContacts.js";
import {
  ContactSearchRequestDTO,
  PaginatedContactResponseDTO,
  PaginatedContactSearchRequestDTO,
} from "grassroots-shared/Contact.dto";
import { cast } from "grassroots-shared/util/Cast";

export const Route = createFileRoute("/SharedSearch")({
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
