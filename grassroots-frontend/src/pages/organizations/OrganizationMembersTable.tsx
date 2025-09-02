import { Table } from "@mantine/core";
import { JSX } from "react";
import type { sampleTableDataType } from "./OrganizationPage";
interface OrganizationMembersTableProps {
  tableData: sampleTableDataType[];
}

export function OrganizationMembersTable({
  tableData,
}: OrganizationMembersTableProps): JSX.Element {
  const rows = tableData.map((member) => (
    <Table.Tr key={member.id}>
      <Table.Td>{member.firstName}</Table.Td>
      <Table.Td>{member.lastName}</Table.Td>
      <Table.Td>{member.role}</Table.Td>
      <Table.Td>
        {member.emails?.map((email: string) => {
          return <p key={email}>- {email}</p>;
        }) ?? ""}
      </Table.Td>
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
