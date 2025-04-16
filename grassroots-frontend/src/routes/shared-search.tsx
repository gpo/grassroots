import { createFileRoute } from "@tanstack/react-router";
import { JSX, useState } from "react";
import { ContactSearchInDTO } from "../grassroots-shared/contact.dto.entity";
import { cast } from "../grassroots-shared/type-utils";
import { PaginatedContacts } from "../components/paginated_contacts";
import { useContactSearch } from "../hooks/useContactSearch";

export const Route = createFileRoute("/shared-search")({
  component: SharedSearch,
  validateSearch: (search: Record<string, unknown>): ContactSearchInDTO => {
    return cast(ContactSearchInDTO, search);
  },
});

const ROWS_PER_PAGE = 10;

function SharedSearch(): JSX.Element {
  const search = Route.useSearch();
  const [rowsToSkip, setRowsToSkip] = useState<number>(0);

  const { data: results } = useContactSearch({
    contact: search,
    paginated: {
      rowsToSkip,
      rowsToTake: ROWS_PER_PAGE,
    },
  });
  return results ? (
    <>
      {/*TODO: re-enable <SessionAuth>*/}
      <PaginatedContacts
        contacts={results.contacts}
        paginated={results.paginated}
        setRowsToSkip={setRowsToSkip}
        rowsPerPage={ROWS_PER_PAGE}
      ></PaginatedContacts>
      {/* </SessionAuth>*/}
    </>
  ) : (
    <></>
  );
}
