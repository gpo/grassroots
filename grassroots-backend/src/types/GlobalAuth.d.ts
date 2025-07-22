import { UserDTO } from "../grassroots-shared/User.dto";

global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends UserDTO {}
  }
}
