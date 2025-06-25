import { UserEntity } from "../users/User.entity";

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends UserEntity {}
  }
}
