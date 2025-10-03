import { createFileRoute } from "@tanstack/react-router";
import { JSX, useState } from "react";
import { usePhoneCanvassContactList } from "../../../hooks/usePhoneCanvassContactList.js";
import {
  PaginatedPhoneCanvassContactListRequestDTO,
  PaginatedPhoneCanvassContactResponseDTO,
} from "grassroots-shared/dtos/PhoneCanvass/PhoneCanvass.dto";
import { PaginatedContacts } from "../../../components/PaginatedContacts.js";
import { PaginatedContactResponseDTO } from "grassroots-shared/dtos/Contact.dto";
import { PaginatedRequestDTO } from "grassroots-shared/dtos/Paginated.dto";

export const Route = createFileRoute("/PhoneCanvass/Manage/$phoneCanvassId")({
  component: ManagePhoneCanvass,
});

const ROWS_PER_PAGE = 10;

function ManagePhoneCanvass(): JSX.Element {
  const { phoneCanvassId } = Route.useParams();
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
