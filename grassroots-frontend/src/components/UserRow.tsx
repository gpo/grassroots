import { JSX } from "react";
import { UserDTO } from "../grassroots-shared/User.dto.js";

interface UserRowProps {
  user: UserDTO;
}

export function UserRow({ user }: UserRowProps): JSX.Element {
  return (
    <p key={user.id}>
      {user.firstName} {user.lastName} ({user.emails?.join(", ")})
    </p>
  );
}
