import { UserDTO } from "grassroots-shared/User.dto";

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends UserDTO {}
  }
}
