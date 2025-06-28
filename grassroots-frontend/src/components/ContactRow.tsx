import { JSX } from "react";
import { ContactDTO } from "../grassroots-shared/Contact.dto";

interface ContactRowProps {
  contact: ContactDTO;
}

export function ContactRow(props: ContactRowProps): JSX.Element {
  return (
    <p>
      {props.contact.firstName} {props.contact.lastName} ({props.contact.email})
    </p>
  );
}
