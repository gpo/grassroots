import { JSX, useState } from "react";
import { ManagePhoneCanvassRoute } from "../../../Routes/PhoneCanvass/Manage.$phoneCanvassId.js";
import { PaginatedContactResponseDTO } from "grassroots-shared/dtos/Contact.dto";
import { PaginatedRequestDTO } from "grassroots-shared/dtos/Paginated.dto";
import {
  PaginatedPhoneCanvassContactListRequestDTO,
  PaginatedPhoneCanvassContactResponseDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { LinkButton } from "../../../Components/LinkButton.js";
import { PaginatedContacts } from "../../Contacts/Components/PaginatedContacts.js";
import { usePhoneCanvassContactList } from "../Logic/UsePhoneCanvassContactList.js";

const ROWS_PER_PAGE = 10;

export function ManagePhoneCanvass(): JSX.Element {
  const { phoneCanvassId } = ManagePhoneCanvassRoute.useParams();
  const [rowsToSkip, setRowsToSkip] = useState<number>(0);

  const paginatedPhoneCanvassContacts =
    usePhoneCanvassContactList(
      PaginatedPhoneCanvassContactListRequestDTO.from({
        phoneCanvassId,
        paginated: PaginatedRequestDTO.from({
          rowsToSkip: rowsToSkip,
          rowsToTake: ROWS_PER_PAGE,
        }),
      }),
    ).data ?? PaginatedPhoneCanvassContactResponseDTO.empty();

  return (
    <>
      <h1> Manage your phone canvass </h1>
      <LinkButton
        to="/PhoneCanvass/$phoneCanvassId"
        params={{ phoneCanvassId: phoneCanvassId }}
        variant="filled"
      >
        Participate
      </LinkButton>
      <PaginatedContacts
        paginatedContactResponse={PaginatedContactResponseDTO.from({
          contacts: paginatedPhoneCanvassContacts.contacts.map(
            (x) => x.contact,
          ),
          paginated: paginatedPhoneCanvassContacts.paginated,
        })}
        setRowsToSkip={setRowsToSkip}
        rowsPerPage={ROWS_PER_PAGE}
      ></PaginatedContacts>
    </>
  );
}
