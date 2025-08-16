import { CASLSubjectWrapper } from "grassroots-shared/CASLInfra";
import { SUBJECTS } from "src/auth/CASLSubjects";

type SubjectConstructors = (typeof SUBJECTS)[number];

// CommonProps is stripping out the subject type right now...
type CASLSubjectsOverride = {
  [SubjectConstructor in SubjectConstructors as SubjectConstructor["__caslSubjectTypeStatic"]]: CommonProps<
    InstanceType<SubjectConstructor>,
    ReturnType<InstanceType<SubjectConstructor>["toDTO"]>
  > & { __caslSubjectType: SubjectConstructor["__caslSubjectTypeStatic"] };
};

declare module "grassroots-shared/CASLInfra" {
  interface CASLSubjectWrapper {
    caslSubjects: CASLSubjectsOverride;
  }
}
