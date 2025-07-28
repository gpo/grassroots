import { createFileRoute } from "@tanstack/react-router";
import { JSX, useState } from "react";
import { useContactSearch } from "../hooks/useContactSearch";
import { PaginatedContacts } from "../components/PaginatedContacts";
import {
  ContactSearchRequestDTO,
  PaginatedContactSearchRequestDTO,
  cast,
} from "@grassroots/shared";

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

  const { data: paginatedContactResponse } = useContactSearch(
    PaginatedContactSearchRequestDTO.from({
      contact: search,
      paginated: {
        rowsToSkip,
        rowsToTake: ROWS_PER_PAGE,
      },
    }),
  );
  return (
    <PaginatedContacts
      paginatedContactResponse={paginatedContactResponse}
      setRowsToSkip={setRowsToSkip}
      rowsPerPage={ROWS_PER_PAGE}
    ></PaginatedContacts>
  );
}
