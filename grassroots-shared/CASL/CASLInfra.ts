import { CASLSubjects } from "@shared/CASLSubjects";
import { MongoAbility, subject } from "@casl/ability";
import { CASLAction } from "../Permission";

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
