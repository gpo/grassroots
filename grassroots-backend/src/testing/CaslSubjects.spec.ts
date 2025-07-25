import { describe, expect, it } from "vitest";
import {
  can,
  permissionsToCaslAbilities,
} from "../grassroots-shared/Permission";
import { ContactDTO } from "../grassroots-shared/Contact.dto";

describe("permissionsToCaslAbilities", () => {
  const contact = ContactDTO.from({
    id: 1,
    email: "a@a.com",
    firstName: "d",
    lastName: "d",
    phoneNumber: "226-888-8888",
  });

  it("shouldn't allow someone with no permissions to view contacts", () => {
    const ability = permissionsToCaslAbilities(new Set([]));
    expect(can(ability, "read", "Contact", contact)).toBe(false);
  });

  it("should allow someone with permissions to view contacts", () => {
    const ability = permissionsToCaslAbilities(new Set(["VIEW_CONTACTS"]));
    expect(can(ability, "read", "Contact", contact)).toBe(true);
  });
});
