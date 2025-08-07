import {
  AbilityBuilder,
  createMongoAbility,
  MongoAbility,
  MongoQuery,
  subject,
} from "@casl/ability";
import { UserEntity } from "../users/User.entity";
import { ContactEntity } from "../contacts/entities/Contact.entity";
import { CommonProps } from "./util/TypeUtils";
import { AbilityQuery, rulesToQuery } from "@casl/ability/extra";
import { FilterQuery } from "@mikro-orm/core";

export enum Permission {
  VIEW_CONTACTS = "VIEW_CONTACTS",
  MANAGE_CONTACTS = "MANAGE_CONTACTS",
  MANAGE_USERS = "MANAGE_USERS",
}

type Action = "read" | "edit";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SUBJECTS = [UserEntity, ContactEntity] as const;

type SubjectConstructors = (typeof SUBJECTS)[number];

// CommonProps is stripping out the subject type right now...
export type CASLSubjects = {
  [SubjectConstructor in SubjectConstructors as SubjectConstructor["__caslSubjectTypeStatic"]]: CommonProps<
    InstanceType<SubjectConstructor>,
    ReturnType<InstanceType<SubjectConstructor>["toDTO"]>
  > & { __caslSubjectType: SubjectConstructor["__caslSubjectTypeStatic"] };
};

export function buildCASLSubject<K extends keyof CASLSubjects>(
  k: K,
  x: Omit<CASLSubjects[K], "__caslSubjectType">,
): CASLSubjects[K] {
  // Type inference isn't quite clever enough here.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {
    ...x,
    __caslSubjectType: k,
  } as CASLSubjects[K];
}

type CASLSubjectUnion = CASLSubjects[keyof CASLSubjects];

// MongoAbility needs to know both about the string types (keyof CASLSubjects) and the object structure (CASLSubjects).
// It maps from strings to object types via `detectSubjectType` below.
// TODO: don't export once we have better tests.
export type AppAbility = MongoAbility<
  [Action, keyof CASLSubjects | CASLSubjectUnion]
>;

// CASL uses "can" both to define abilities and query them.
// Note that this is the method for querying.
export function can(
  ability: AppAbility,
  action: Action,
  type: keyof CASLSubjects,
  object: CASLSubjectUnion,
): boolean {
  return ability.can(action, subject(type, object));
}

// We need this strongly typed, so this is copied from MikroORM's QueryOperator.
const OPERATORS = [
  "$and",
  "$or",
  "$eq",
  "$ne",
  "$in",
  "$nin",
  "$not",
  "$none",
  "$some",
  "$every",
  "$gt",
  "$gte",
  "$lt",
  "$lte",
  "$like",
  "$re",
  "$ilike",
  "$fulltext",
  "$overlap",
  "$contains",
  "$contained",
  "$exists",
  "$hasKey",
  "$hasKeys",
  "$hasSomeKeys",
] as const;

const OPERATORS_SET = new Set<string>(OPERATORS);

// Based on https://casl.js.org/v4/en/advanced/ability-to-database-query.
// This is mostly a silly cast currently. As we run into failure cases,
// we'll need to handle them appropriately.
function mapOperators<T>(query: AbilityQuery<MongoQuery>): FilterQuery<T> {
  JSON.parse(JSON.stringify(query), function keyToSymbol<
    TValue,
  >(key: string, value: TValue): TValue {
    if (key.startsWith("$")) {
      if (!OPERATORS_SET.has(key)) {
        throw new Error(`Invalid operator in CASL rule: ${key}`);
      }
    }

    return value;
  });

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return query as FilterQuery<T>;
}

// Returns null if access is never appropriate.
export function getAccessRules<
  T extends {
    new (...args: unknown[]): unknown;
    __caslSubjectTypeStatic: keyof CASLSubjects;
  },
  TInstance = InstanceType<T>,
>(ability: AppAbility, action: Action, type: T): FilterQuery<TInstance> | null {
  const query: AbilityQuery<MongoQuery> | null = rulesToQuery<
    AppAbility,
    MongoQuery
  >(ability, action, type.__caslSubjectTypeStatic, (rule) => {
    if (rule.conditions === undefined) {
      throw new Error("CASL rule with null conditions");
    }
    return rule.inverted ? { $not: rule.conditions } : rule.conditions;
  });
  if (query === null) {
    return null;
  }
  return mapOperators<TInstance>(query);
}

export function permissionsToCaslAbilities(
  user: CASLSubjects["User"],
  activeOrganizationId: number,
  permissions: Set<keyof typeof Permission>,
): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(
    createMongoAbility,
  );
  void cannot;
  can("read", "User", { id: user.id });

  const PERMISSIONS_TO_CASL_RULES: Record<keyof typeof Permission, () => void> =
    {
      VIEW_CONTACTS: () => {
        can("read", "Contact", { organizationId: activeOrganizationId });
      },
      MANAGE_CONTACTS: () => {
        can("edit", "Contact");
      },
      MANAGE_USERS: () => {
        can("edit", "User");
      },
    };

  for (const permission of permissions) {
    PERMISSIONS_TO_CASL_RULES[permission]();
  }

  return build({
    detectSubjectType: (obj: CASLSubjectUnion) => obj.__caslSubjectType,
  });
}
