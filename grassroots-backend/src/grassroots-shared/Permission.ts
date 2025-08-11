import { CASLSubjects } from "@shared/CASLSubjects";
import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import { AppAbility, CASLSubjectUnion } from "./CASL/CASLInfra";

export enum Permission {
  VIEW_CONTACTS = "VIEW_CONTACTS",
  MANAGE_CONTACTS = "MANAGE_CONTACTS",
  MANAGE_USERS = "MANAGE_USERS",
}

export type CASLAction = "read" | "edit";

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
