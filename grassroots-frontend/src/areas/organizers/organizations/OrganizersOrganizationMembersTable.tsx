import { Table } from "@mantine/core";
import { JSX } from "react";
import { sampleTableDataType } from "./OrganizersOrganizationDashboard";
interface OrganizersOrganizationMembersTableProps {
  tableData: sampleTableDataType[];
}

export function OrganizersOrganizationMembersTable({
  tableData,
}: OrganizersOrganizationMembersTableProps): JSX.Element {
  const rows = tableData.map((member) => (
    <Table.Tr key={member.memberID}>
      <Table.Td>{member.fname}</Table.Td>
      <Table.Td>{member.lname}</Table.Td>
      <Table.Td>{member.role}</Table.Td>
      <Table.Td>{member.address}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>First Name</Table.Th>
          <Table.Th>Last Name</Table.Th>
          <Table.Th>Role</Table.Th>
          <Table.Th>Address</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
}
