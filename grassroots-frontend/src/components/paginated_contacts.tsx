import { JSX } from "react";
import { ContactRow } from "./contact_row";
import { PaginatedContactOutDTO } from "../grassroots-shared/contact.entity.dto";

type PaginatedContactsProps = PaginatedContactOutDTO & {
  setRowsToSkip: React.Dispatch<React.SetStateAction<number>>;
  rowsPerPage: number;
};

export function PaginatedContacts(props: PaginatedContactsProps): JSX.Element {
  const { paginated, contacts, setRowsToSkip } = props;
  const rows = contacts.map((x) => {
    return <ContactRow contact={x} key={x.id}></ContactRow>;
  });

  return (
    <>
      {rows}
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
