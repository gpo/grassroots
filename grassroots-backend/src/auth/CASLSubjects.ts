import { ContactEntity } from "src/contacts/entities/Contact.entity";
import { UserEntity } from "src/users/User.entity";

// This is used in types/CASLSubjects.d.ts.
export const SUBJECTS = [UserEntity, ContactEntity] as const;
