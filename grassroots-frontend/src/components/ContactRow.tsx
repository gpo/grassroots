import { JSX } from "react";
import { ContactResponseDTO } from "../grassroots-shared/Contact.dto";

interface ContactRowProps {
  contact: ContactResponseDTO;
}

export function ContactRow(props: ContactRowProps): JSX.Element {
  return (
    <p>
      {props.contact.firstName} {props.contact.lastName} ({props.contact.email})
    </p>
  );
}
