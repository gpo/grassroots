import { JSX } from "react";
import { ContactRow } from "./contact_row";
import { ContactEntityOutDTO } from "../grassroots-shared/contact.dto.entity";

interface ContactsProps {
  contacts: ContactEntityOutDTO[];
}

export function Contacts(props: ContactsProps): JSX.Element {
  const rows = props.contacts.map((x) => {
    return <ContactRow contact={x} key={x.id}></ContactRow>;
  });
  return <>{rows}</>;
}
