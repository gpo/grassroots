import { Table } from "@mantine/core";
import { JSX } from "react";
import { Link } from "@tanstack/react-router";
import { OrganizationsDTO } from "../../grassroots-shared/Organization.dto.js";
interface OrganizersTableProps {
  tableData: OrganizationsDTO;
}

export function MyTable({ tableData }: OrganizersTableProps): JSX.Element {
  const rows = tableData.organizations.map((riding) => (
    <Table.Tr key={riding.name} style={{ cursor: "pointer" }}>
      <Table.Td>
        <Link
          to="/Organizations/$organizationId"
          params={{ organizationId: riding.id }}
        >
          {riding.name}
        </Link>
      </Table.Td>
      <Table.Td>{riding.abbreviatedName}</Table.Td>
      <Table.Td>{riding.description}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Riding Name</Table.Th>
          <Table.Th>Abbrev Name</Table.Th>
          <Table.Th>Description</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
}
