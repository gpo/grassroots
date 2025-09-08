import { JSX } from "react";
import { MyTable } from "./MyTable.jsx";
import { OrganizationsDTO } from "../../grassroots-shared/Organization.dto.js";
import { useOrganizations } from "../../hooks/useOrganizations.js";

export function MyPage(): JSX.Element {
  const organizations = useOrganizations();
  return (
    <div>
      <h2>My Dashboard</h2>
      <MyTable
        tableData={
          organizations.data ?? OrganizationsDTO.from({ organizations: [] })
        }
      />
    </div>
  );
}
