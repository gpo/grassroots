import { JSX } from "react";
import { UserDTO } from "grassroots-shared/User.dto";

interface UserRowProps {
  user: UserDTO;
}

export function UserRow(props: UserRowProps): JSX.Element {
  return (
    <p>
      {props.user.firstName} {props.user.lastName} (
      {props.user.emails?.join(", ")})
    </p>
  );
}
