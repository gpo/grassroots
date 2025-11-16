import { PhoneCanvassContactDTO } from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { JSX } from "react";
import { ContactCard } from "../../Contacts/Components/ContactCard.js";

interface PhoneCanvassContactCardProps {
  phoneCanvassContact: PhoneCanvassContactDTO;
}

export function PhoneCanvassContactCard(
  props: PhoneCanvassContactCardProps,
): JSX.Element {
  return (
    <ContactCard phoneCanvassContact={props.phoneCanvassContact}></ContactCard>
  );
}
