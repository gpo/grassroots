// The backend and frontend need different notions of CASL Subjects, since the frontend
// doesn't know about entities. This is used on the frontend instead of the definition
// provided in the backend.

import { ContactDTO } from "../Contact.dto";
import { UserDTO } from "../User.dto";
import { PropsOf } from "../util/TypeUtils";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SUBJECTS = [UserDTO, ContactDTO] as const;

export type CASLSubjects = {
  [T in (typeof SUBJECTS)[number] as T["__caslSubjectTypeStatic"]]: PropsOf<
    InstanceType<T>
  > & { __caslSubjectType: T["__caslSubjectTypeStatic"] };
};
