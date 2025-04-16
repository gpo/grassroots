import { JSX } from "react";
import { ContactEntityOutDTO } from "../grassroots-shared/contact.dto.entity";

interface ContactRowProps {
  contact: ContactEntityOutDTO;
}

export function ContactRow(props: ContactRowProps): JSX.Element {
  return (
    <>
      <p>
        {props.contact.firstName} {props.contact.lastName} (
        {props.contact.email})
      </p>
    </>
  );
}
