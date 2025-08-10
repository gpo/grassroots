import {
  AbilityBuilder,
  createMongoAbility,
  MongoAbility,
  subject,
} from "@casl/ability";

import { CASLSubjects } from "@shared/CASLSubjects";

export enum Permission {
  VIEW_CONTACTS = "VIEW_CONTACTS",
  MANAGE_CONTACTS = "MANAGE_CONTACTS",
  MANAGE_USERS = "MANAGE_USERS",
}

export type CASLAction = "read" | "edit";

export function buildCASLSubject<K extends keyof CASLSubjects>(
  k: K,
  x: Omit<CASLSubjects[K], "__caslSubjectType">,
): CASLSubjects[K] {
  // Type inference isn't quite clever enough here.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {
    ...x,
    __caslSubjectType: k,
  } as unknown as CASLSubjects[K];
}

type CASLSubjectUnion = CASLSubjects[keyof CASLSubjects];

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
