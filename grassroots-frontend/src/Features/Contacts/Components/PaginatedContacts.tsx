import { JSX, useCallback, useState } from "react";
import { ContactRow } from "./ContactRow.js";
import {
  ContactDTO,
  PaginatedContactResponseDTO,
} from "grassroots-shared/dtos/Contact.dto";
import { Modal, Table } from "@mantine/core";
import { usePhoneCanvassContactByRawContactId } from "../../PhoneCanvass/Logic/UsePhoneCanvassContact.js";
import { ContactCard } from "./ContactCard.js";

interface PaginatedContactsProps {
  paginatedContactResponse: PaginatedContactResponseDTO;
  setRowsToSkip: React.Dispatch<React.SetStateAction<number>>;
  rowsPerPage: number;
  phoneCanvassId: string;
}

export function PaginatedContacts(props: PaginatedContactsProps): JSX.Element {
  const { paginatedContactResponse, setRowsToSkip } = props;
  const { paginated, contacts } = paginatedContactResponse;
  const [focusedContactId, setFocusedContactId] = useState<number | undefined>(
    undefined,
  );

  const currentContact = usePhoneCanvassContactByRawContactId({
    rawContactId: focusedContactId,
    phoneCanvassId: props.phoneCanvassId,
  }).data;

  const viewContactDetail = useCallback((contact: ContactDTO) => {
    setFocusedContactId(contact.id);
  }, []);

  console.log("current contact", currentContact);

  const contactsRows = contacts.map((x) => {
    return (
      <ContactRow
        contact={x}
        key={x.id}
        viewContactDetail={viewContactDetail}
      ></ContactRow>
    );
  });
  const contactsEl = (
    <Table highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Email</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{contactsRows}</Table.Tbody>
    </Table>
  );

  return (
    <>
      <Modal
        size="80%"
        opened={currentContact !== undefined}
        onClose={() => {
          setFocusedContactId(undefined);
        }}
      >
        <ContactCard
          phoneCanvassContact={currentContact}
          phoneCanvassId={props.phoneCanvassId}
        ></ContactCard>
      </Modal>
      {contactsEl}
      <div>
        {paginated.rowsSkipped}–{paginated.rowsSkipped + contacts.length} /{" "}
        {paginated.rowsTotal}
      </div>
      <button
        disabled={paginated.rowsSkipped <= 0}
        onClick={() => {
          setRowsToSkip((x) => Math.max(x - props.rowsPerPage, 0));
        }}
      >
        Prev
      </button>
      <button
        disabled={
          paginated.rowsSkipped + contacts.length >= paginated.rowsTotal
        }
        onClick={() => {
          setRowsToSkip((x) =>
            Math.min(x + props.rowsPerPage, paginated.rowsTotal - 1),
          );
        }}
      >
        Next
      </button>
    </>
  );
}
