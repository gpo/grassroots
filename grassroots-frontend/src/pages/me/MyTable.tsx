import { Table } from "@mantine/core";
import { JSX } from "react";
import { sampleTableDataType } from "./MyPage";
import { Link } from "@tanstack/react-router";
interface OrganizersTableProps {
  tableData: sampleTableDataType[];
}

export function MyTable({ tableData }: OrganizersTableProps): JSX.Element {
  const rows = tableData.map((riding) => (
    <Table.Tr key={riding.name} style={{ cursor: "pointer" }}>
      <Table.Td>
        <Link
          to="/Organizations/$organizationId"
          params={{ organizationId: riding.id.toString() }}
        >
          {riding.name}
        </Link>
      </Table.Td>
      <Table.Td>{riding.abbrName}</Table.Td>
      <Table.Td>{riding.desc}</Table.Td>
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
