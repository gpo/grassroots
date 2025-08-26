import { MongoAbility, Subject, subject } from "@casl/ability";
import { CASLAction } from "./Permission.js";
import { UserDTO } from "./User.dto.js";
import { ContactDTO } from "./Contact.dto.js";
import { PropsOf } from "./util/TypeUtils.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SUBJECTS = [UserDTO, ContactDTO] as const;
type SubjectsListExtends = readonly {
  __caslSubjectTypeStatic: string;
  new (...args: any): Record<any, any>;
}[];

export interface CASLSubjectWrapperGeneric<
  TSubjectsList extends SubjectsListExtends,
> {
  // The backend augments this type declaration to enforce that only properties present in both DTOs and entities,
  // are available.
  caslSubjects: {
    [T in TSubjectsList[number] as T["__caslSubjectTypeStatic"]]: PropsOf<
      InstanceType<T>
    > & { __caslSubjectType: T["__caslSubjectTypeStatic"] } & Subject;
  };
}

export type CASLSubjectsGeneric<TSubjectsList extends SubjectsListExtends> =
  CASLSubjectWrapperGeneric<TSubjectsList>["caslSubjects"];

export type CASLSubjectUnionGeneric<TSubjectsList extends SubjectsListExtends> =
  CASLSubjectsGeneric<TSubjectsList>[keyof CASLSubjectsGeneric<TSubjectsList>] &
    Subject;

type CASLSubjectReference<TSubjectsList extends SubjectsListExtends> =
  | keyof CASLSubjectsGeneric<TSubjectsList>
  | CASLSubjectUnionGeneric<TSubjectsList>;

// MongoAbility needs to know both about the string types (keyof CASLSubjects) and the object structure (CASLSubjects).
// It maps from strings to object types via `detectSubjectType` below.
// TODO: don't export once we have better tests.
export type AppAbilityGeneric<TSubjectsList extends SubjectsListExtends> =
  MongoAbility<[CASLAction, CASLSubjectReference<TSubjectsList>]>;

// CASL uses "can" both to define abilities and query them.
// Note that this is the method for querying.
export function canGeneric<TSubjectsList extends SubjectsListExtends>(
  ability: AppAbilityGeneric<TSubjectsList>,
  action: CASLAction,
  type: keyof CASLSubjectsGeneric<TSubjectsList> & string,
  object: CASLSubjectUnionGeneric<TSubjectsList> & Subject,
): boolean {
  return ability.can(action, subject(type, object));
}

const can = canGeneric<typeof SUBJECTS>;
