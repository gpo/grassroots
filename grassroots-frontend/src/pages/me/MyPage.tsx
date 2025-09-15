import { JSX } from "react";
import { MyTable } from "./MyTable.js";
import { OrganizationsDTO } from "grassroots-shared/dtos/Organization.dto";
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
