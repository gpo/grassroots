import { JSX, useState } from "react";
import { Route as OrgRoute } from "../../routes/Organizations/$organizationId.js";
import { useContactSearch } from "../../hooks/useContactSearch.js";
import {
  PaginatedContactResponseDTO,
  PaginatedContactSearchRequestDTO,
} from "grassroots-shared/dtos/Contact.dto";
import { PaginatedContacts } from "../../components/PaginatedContacts.js";

const ROWS_PER_PAGE = 10;

export function OrganizationDashboard(): JSX.Element {
  const { organizationId } = OrgRoute.useParams();
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
