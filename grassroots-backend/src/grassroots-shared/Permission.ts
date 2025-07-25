import {
  AbilityBuilder,
  createMongoAbility,
  MongoAbility,
  subject,
} from "@casl/ability";
import { UserEntity } from "../users/User.entity";
import { ContactEntity } from "../contacts/entities/Contact.entity";
import { CommonProps } from "./util/TypeUtils";

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
type CASLSubjects = {
  [SubjectConstructor in SubjectConstructors as SubjectConstructor["__caslSubjectTypeStatic"]]: CommonProps<
    InstanceType<SubjectConstructor>,
    ReturnType<InstanceType<SubjectConstructor>["toDTO"]>
  > & { __caslSubjectType: SubjectConstructor["__caslSubjectTypeStatic"] };
};

type CASLSubjectUnion = CASLSubjects[keyof CASLSubjects];

// MongoAbility needs to know both about the string types (keyof CASLSubjects) and the object structure (CASLSubjects).
// It maps from strings to object types via `detectSubjectType` below.
type AppAbility = MongoAbility<[Action, keyof CASLSubjects | CASLSubjectUnion]>;

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

export function permissionsToCaslAbilities(
  user: CASLSubjects["User"],
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
        can("read", "Contact");
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
