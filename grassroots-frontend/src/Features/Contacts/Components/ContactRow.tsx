import { JSX } from "react";
import { ContactDTO } from "grassroots-shared/dtos/Contact.dto";
import { Table } from "@mantine/core";

interface ContactRowProps {
  contact: ContactDTO;
  viewContactDetail: (contact: ContactDTO) => void;
}

export function ContactRow(props: ContactRowProps): JSX.Element {
  return (
    <Table.Tr
      key={props.contact.id}
      onClick={() => {
        props.viewContactDetail(props.contact);
      }}
    >
      <Table.Td>{props.contact.formatName()}</Table.Td>
      <Table.Td>{props.contact.email}</Table.Td>
    </Table.Tr>
  );
}
