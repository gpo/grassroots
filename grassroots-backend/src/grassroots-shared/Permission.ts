import {
  AbilityBuilder,
  createMongoAbility,
  MongoAbility,
  subject,
} from "@casl/ability";
import { UserDTO } from "./User.dto";
import { UserEntity } from "../users/User.entity";
import { ContactDTO } from "./Contact.dto";
import { ContactEntity } from "../contacts/entities/Contact.entity";
import { PropsOf } from "./util/PropsOf";

export enum Permission {
  VIEW_CONTACTS = "VIEW_CONTACTS",
  MANAGE_CONTACTS = "MANAGE_CONTACTS",
  MANAGE_USERS = "MANAGE_USERS",
}

type Action = "read" | "edit";

type CommonProps<A, B> = {
  [K in keyof PropsOf<A> & keyof PropsOf<B>]: PropsOf<A>[K];
};

interface CASLSubjects {
  User: CommonProps<UserDTO, UserEntity>;
  Contact: CommonProps<ContactDTO, ContactEntity>;
}

// This creates a union type of all CASLSubjects, and adds the __caslSubjectType__ property
// which is used in the ability builder to determine subject type.
type CASLSubjectUnion = {
  [K in keyof CASLSubjects]: CASLSubjects[K] & { __caslSubjectType__: K };
}[keyof CASLSubjects];

// MongoAbility needs to know both about the string types (keyof CASLSubjects) and the object structure (CASLSubjects).
// It's a bit fuzzy to me how it does this from a union of these types, but it works!
type AppAbility = MongoAbility<[Action, keyof CASLSubjects | CASLSubjectUnion]>;

export function defineAbility(): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(
    createMongoAbility,
  );
  void cannot;

  can("read", "User", { emails: { $exists: true } });
  can("read", "User", { id: { $eq: "5" } });

  return build({
    detectSubjectType: (obj: CASLSubjectUnion) => obj.__caslSubjectType__,
  });
}

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
  permissions: Set<keyof typeof Permission>,
): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(
    createMongoAbility,
  );
  void cannot;

  const PERMISSIONS_TO_CASL_RULES: Record<keyof typeof Permission, () => void> =
    {
      VIEW_CONTACTS: () => {
        can("read", "User", { id: { $exists: true } });
        can("read", "User", { id: "0" });
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
    detectSubjectType: (obj: CASLSubjectUnion) => obj.__caslSubjectType__,
  });
}
