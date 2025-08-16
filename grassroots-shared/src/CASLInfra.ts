import { MongoAbility, subject } from "@casl/ability";
import { CASLAction } from "./Permission.js";
import { UserDTO } from "./User.dto.js";
import { ContactDTO } from "./Contact.dto.js";
import { PropsOf } from "./util/TypeUtils.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SUBJECTS = [UserDTO, ContactDTO] as const;

export interface CASLSubjectWrapper {
  // The backend augments this type declaration to enforce that only properties present in both DTOs and entities,
  // are available.
  caslSubjects: {
    [T in (typeof SUBJECTS)[number] as T["__caslSubjectTypeStatic"]]: PropsOf<
      InstanceType<T>
    > & { __caslSubjectType: T["__caslSubjectTypeStatic"] };
  };
}

export type CASLSubjects = CASLSubjectWrapper["caslSubjects"];

export type CASLSubjectUnion = CASLSubjects[keyof CASLSubjects];

// MongoAbility needs to know both about the string types (keyof CASLSubjects) and the object structure (CASLSubjects).
// It maps from strings to object types via `detectSubjectType` below.
// TODO: don't export once we have better tests.
export type AppAbility = MongoAbility<
  [CASLAction, keyof CASLSubjects | CASLSubjectUnion]
>;

// CASL uses "can" both to define abilities and query them.
// Note that this is the method for querying.
export function can(
  ability: AppAbility,
  action: CASLAction,
  type: keyof CASLSubjects,
  object: CASLSubjectUnion,
): boolean {
  return ability.can(action, subject(type, object));
}
