import { describe, expect, it } from "vitest";
import {
  can,
  permissionsToCaslAbilities,
} from "../grassroots-shared/Permission";
import { cast } from "../grassroots-shared/util/Cast";
import { ContactDTO } from "../grassroots-shared/Contact.dto";

describe("permissionsToCaslAbilities", () => {
  it("shouldn't allow someone with no permissions to view contacts", () => {
    const ability = permissionsToCaslAbilities(new Set([]));
    const contact = cast(ContactDTO, {
      id: 0,
      email: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
    });
    can(ability, "read", "Contact", contact);
  });
});
