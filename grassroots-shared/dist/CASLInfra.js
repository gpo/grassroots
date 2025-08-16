import { subject } from "@casl/ability";
import { UserDTO } from "./User.dto.js";
import { ContactDTO } from "./Contact.dto.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var SUBJECTS = [
    UserDTO,
    ContactDTO
];
// CASL uses "can" both to define abilities and query them.
// Note that this is the method for querying.
export function can(ability, action, type, object) {
    return ability.can(action, subject(type, object));
}
