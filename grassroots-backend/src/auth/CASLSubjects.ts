import { CommonProps } from "grassroots-shared/util/TypeUtils";
import { ContactEntity } from "src/contacts/entities/Contact.entity";
import { UserEntity } from "src/users/User.entity";

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

import _ from "grassroots-shared/CASLInfra";

declare module "grassroots-shared/CASLInfra" {
  interface CASLSubjectWrapper {
    caslSubjects: CASLSubjects;
  }
}
