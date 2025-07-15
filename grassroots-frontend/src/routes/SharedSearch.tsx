import { createFileRoute } from "@tanstack/react-router";
import { JSX, useState } from "react";
import { useContactSearch } from "../hooks/useContactSearch";
import { PaginatedContacts } from "../components/PaginatedContacts";
import {
  ContactSearchRequestDTO,
  PaginatedContactSearchRequestDTO,
} from "../grassroots-shared/Contact.dto";
import { cast } from "../grassroots-shared/util/Cast";
import { PaginatedRequestDTO } from "../grassroots-shared/Paginated.dto";

export const Route = createFileRoute("/SharedSearch")({
  component: SharedSearch,
  validateSearch: (
    search: Record<string, unknown>,
  ): ContactSearchRequestDTO => {
    return cast(ContactSearchRequestDTO, search);
  },
});

const ROWS_PER_PAGE = 10;

function SharedSearch(): JSX.Element | null {
  const search = Route.useSearch();
  const [rowsToSkip, setRowsToSkip] = useState<number>(0);

  const { data: results } = useContactSearch(
    PaginatedContactSearchRequestDTO.from({
      contact: ContactSearchRequestDTO.from(search),
      paginated: PaginatedRequestDTO.from({
        rowsToSkip,
        rowsToTake: ROWS_PER_PAGE,
      }),
    }),
  );
  return results ? (
    <PaginatedContacts
      paginatedContactResponse={results}
      setRowsToSkip={setRowsToSkip}
      rowsPerPage={ROWS_PER_PAGE}
    ></PaginatedContacts>
  ) : null;
}
