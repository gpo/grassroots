import { describe, expect, it } from "vitest";
import { UserDTO } from "grassroots-shared/User.dto";
import mikroORMConfig from "../mikro-orm.config";
import { MikroORM } from "@mikro-orm/core";
import { OrganizationDTO } from "grassroots-shared/Organization.dto";
import { ContactEntity } from "../contacts/entities/Contact.entity";
import { OrganizationEntity } from "../organizations/Organization.entity";
import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import { getAccessRules } from "../auth/CASLIntegration";
import { permissionsToCaslAbilities } from "grassroots-shared/Permission";
import { AppAbility, can } from "grassroots-shared/CASLInfra";
import { ContactSubject } from "casl-subjects/ContactSubject";

const ORG_WITH_PERMISSIONS_ID = 10;

const ORGANIZATION = OrganizationDTO.from({
  id: ORG_WITH_PERMISSIONS_ID,
  name: "Test",
});

describe("permissionsToCaslAbilities", () => {
  const contact = new ContactSubject({
    id: 1,
    email: "a@a.com",
    firstName: "d",
    lastName: "d",
    phoneNumber: "226-888-8888",
    organizationId: ORGANIZATION.id,
  });

  const user = UserDTO.from({
    id: "Foo",
  });

  it("shouldn't allow someone with no permissions to view contacts", () => {
    const ability = permissionsToCaslAbilities(
      user,
      ORG_WITH_PERMISSIONS_ID,
      new Set([]),
    );
    expect(can(ability, "read", "Contact", contact)).toBe(false);
  });

  it("should allow someone with permissions to view contacts", () => {
    const ability = permissionsToCaslAbilities(
      user,
      ORG_WITH_PERMISSIONS_ID,
      new Set(["VIEW_CONTACTS"]),
    );
    expect(can(ability, "read", "Contact", contact)).toBe(true);
  });

  it("shouldn't allow someone with permissions to view contacts outside their active org", () => {
    const ability = permissionsToCaslAbilities(
      user,
      // Pick an org ID other than the one with permissions.
      ORG_WITH_PERMISSIONS_ID + 1,
      new Set(["VIEW_CONTACTS"]),
    );
    expect(can(ability, "read", "Contact", contact)).toBe(false);
  });

  it("should allow someone with no permissions to view only their own user", () => {
    const ability = permissionsToCaslAbilities(
      user,
      ORG_WITH_PERMISSIONS_ID,
      new Set([]),
    );
    expect(can(ability, "read", "User", user)).toBe(true);
    user.id += "idIsNoLongerEqual";
    expect(can(ability, "read", "User", user)).toBe(false);
  });

  it("Should work on the database", async () => {
    const orm = await MikroORM.init(mikroORMConfig);
    const em = orm.em.fork();
    await em.begin();

    const validOrg = em.create(OrganizationEntity, {
      name: "validOrg",
    });
    const invalidOrg = em.create(OrganizationEntity, {
      name: "invalidOrg",
    });
    await em.flush();

    const ability = permissionsToCaslAbilities(
      user,
      validOrg.id,
      new Set(["VIEW_CONTACTS"]),
    );

    const rules = getAccessRules(ability, "read", ContactEntity);
    if (rules === null) {
      throw new Error("Should have access to some contacts");
    }

    em.create(ContactEntity, {
      email: "valid@valid.com",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      organization: validOrg,
    });
    em.create(ContactEntity, {
      email: "invalid@invalid.com",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      organization: invalidOrg,
    });
    const validContacts = await em.findAll(ContactEntity, { where: rules });
    expect(validContacts.length).toBe(1);
    expect(validContacts[0]?.email).toBe("valid@valid.com");
    await em.rollback();
  });

  it("Should support inverted database queries", async () => {
    const orm = await MikroORM.init(mikroORMConfig);
    const em = orm.em.fork();
    await em.begin();
    const validOrg = em.create(OrganizationEntity, {
      name: "validOrg",
    });

    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createMongoAbility,
    );
    can("read", "Contact");
    cannot("read", "Contact", { email: "invalid@invalid.com" });
    const ability = build();

    const rules = getAccessRules(ability, "read", ContactEntity);
    if (rules === null) {
      throw new Error("Should have access to some contacts");
    }

    em.create(ContactEntity, {
      email: "valid@valid.com",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      organization: validOrg,
    });
    em.create(ContactEntity, {
      email: "invalid@invalid.com",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      organization: validOrg,
    });
    const validContacts = await em.findAll(ContactEntity, { where: rules });
    expect(validContacts.length).toBe(1);
    expect(validContacts[0]?.email).toBe("valid@valid.com");
    await em.rollback();
  });
});
