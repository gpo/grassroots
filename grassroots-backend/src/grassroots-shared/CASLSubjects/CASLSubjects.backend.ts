import { ContactEntity } from "../../contacts/entities/Contact.entity";
import { UserEntity } from "../../users/User.entity";
import { CommonProps } from "../util/TypeUtils";

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
