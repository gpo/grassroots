// eslint-disable-next-line check-file/filename-naming-convention
import { createFileRoute } from "@tanstack/react-router";
import { JSX, useState } from "react";
import {
  PaginatedContactResponseDTO,
  PaginatedContactSearchRequestDTO,
} from "grassroots-shared/dtos/Contact.dto";
import { PaginatedContacts } from "../../Features/Contacts/Components/PaginatedContacts.js";
import { useContactSearch } from "../../Features/Contacts/Logic/UseContactSearch.js";
export const Route = createFileRoute("/Organizations/$organizationId")({
  component: OrganizationDetails,
  params: {
    parse: (raw) => ({
      organizationId: Number(raw.organizationId),
    }),
    stringify: (params) => ({
      organizationId: String(params.organizationId),
    }),
  },
});

const ROWS_PER_PAGE = 10;

export function OrganizationDetails(): JSX.Element {
  const { organizationId } = Route.useParams();
  const [rowsToSkip, setRowsToSkip] = useState<number>(0);

  const useContactSearchResults =
    useContactSearch(
      PaginatedContactSearchRequestDTO.from({
        contact: { organizationId: organizationId },
        paginated: { rowsToSkip: rowsToSkip, rowsToTake: ROWS_PER_PAGE },
      }),
    ).data ?? PaginatedContactResponseDTO.empty();
  // TODO: Change title from Org [orgid] to just [Org Name]
  return (
    <div>
      <h2>Organization {organizationId}</h2>
      <PaginatedContacts
        paginatedContactResponse={useContactSearchResults}
        setRowsToSkip={setRowsToSkip}
        rowsPerPage={ROWS_PER_PAGE}
      ></PaginatedContacts>
    </div>
  );
}
