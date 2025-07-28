import { UserDTO } from "@grassroots/shared";

global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends UserDTO {}
  }
}
