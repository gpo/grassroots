import { JSX } from "react";
import { MyTable } from "./MyTable";
import { OrganizationsDTO } from "../../grassroots-shared/Organization.dto";
import { useOrganizations } from "../../hooks/useOrganizations";

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
