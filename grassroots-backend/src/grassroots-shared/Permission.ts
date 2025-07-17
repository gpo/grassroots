import { InferSubjects } from "@casl/ability";

export enum Permission {
  VIEW_CONTACTS = "VIEW_CONTACTS",
  MANAGE_CONTACTS = "MANAGE_CONTACTS",
  MANAGE_USERS = "MANAGE_USERS",
}

type Subjects = InferSubjects<typeof Article | typeof User> | "all";

export type AppAbility = MongoAbility<[Action, Subjects]>;
