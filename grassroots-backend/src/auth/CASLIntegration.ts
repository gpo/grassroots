import { MongoQuery } from "@casl/ability";
import { AbilityQuery, rulesToQuery } from "@casl/ability/extra";
import { FilterQuery } from "@mikro-orm/core";
import { AppAbility, CASLSubjects } from "grassroots-shared/CASLInfra";
import { CASLAction } from "grassroots-shared/Permission";

// Pulled from MikroORM's GroupOperator / QueryOperator, which are enums, and we can't easily extract a list of their keys.
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
  JSON.parse(JSON.stringify(query), function validateKey<
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
>(
  ability: AppAbility,
  action: CASLAction,
  type: T,
): FilterQuery<TInstance> | null {
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
