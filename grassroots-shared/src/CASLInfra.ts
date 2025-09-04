import { MongoAbility, Subject, subject } from "@casl/ability";
import { CASLAction } from "./Permission.js";
import { UserSubject } from "casl-subjects/UserSubject";
import { ContactSubject } from "casl-subjects/ContactSubject";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SUBJECTS = [UserSubject, ContactSubject] as const;

export type CASLSubjects = {
  [T in (typeof SUBJECTS)[number] as T /* Each subject has a __caslSubjectTypeStatic property, grab it. */ extends {
    __caslSubjectTypeStatic: infer K;
  }
    ? K & string
    : never]: InstanceType<T>;
};

export type CASLSubjectUnion = CASLSubjects[keyof CASLSubjects];

type CASLSubjectReference = keyof CASLSubjects | CASLSubjectUnion;

// MongoAbility needs to know both about the string types (keyof CASLSubjects) and the object structure (CASLSubjects).
// It maps from strings to object types via `detectSubjectType` below.
// TODO: don't export once we have better tests.
export type AppAbility = MongoAbility<[CASLAction, CASLSubjectReference]>;

// CASL uses "can" both to define abilities and query them.
// Note that this is the method for querying.
export function can(
  ability: AppAbility,
  action: CASLAction,
  type: keyof CASLSubjects,
  object: CASLSubjectUnion & Subject,
): boolean {
  return ability.can(action, subject(type, object));
}
