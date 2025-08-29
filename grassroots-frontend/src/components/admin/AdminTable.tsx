import { Table } from "@mantine/core";
import { JSX } from "react";
import { sampleTableDataType } from "./AdminPage";
interface AdminTableProps {
  tableData: sampleTableDataType[];
}

export function AdminTable({ tableData }: AdminTableProps): JSX.Element {
  const rows = tableData.map((riding) => (
    <Table.Tr key={riding.orgName}>
      <Table.Td>{riding.orgName}</Table.Td>
      <Table.Td>{riding.parentOrg}</Table.Td>
      <Table.Td>{riding.abbrName}</Table.Td>
      <Table.Td>{riding.desc}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Riding Name</Table.Th>
          <Table.Th>Parent Org</Table.Th>
          <Table.Th>Abbrev Name</Table.Th>
          <Table.Th>Description</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
}
