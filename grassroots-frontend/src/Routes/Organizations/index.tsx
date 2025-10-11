// eslint-disable-next-line check-file/no-index, check-file/filename-naming-convention
import { createFileRoute } from "@tanstack/react-router";
import { OrganizationsTable } from "../../Features/Organizations/Components/OrganizationsTable.js";
import { useOrganizations } from "../../Features/Organizations/Logic/UseOrganizations.js";
import { JSX } from "react";
import { OrganizationsDTO } from "grassroots-shared/dtos/Organization.dto";

export const Route = createFileRoute("/Organizations/")({
  component: Organizations,
});

export function Organizations(): JSX.Element {
  const organizations = useOrganizations();
  return (
    <div>
      <h2>My Dashboard</h2>
      <OrganizationsTable
        tableData={
          organizations.data ?? OrganizationsDTO.from({ organizations: [] })
        }
      />
    </div>
  );
}
