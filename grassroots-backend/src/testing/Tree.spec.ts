// Use the OrganizationDTO as an example.

import { describe, expect, it } from "vitest";
import { OrganizationDTO, cast, Tree } from "@grassroots/shared";

describe("tree", () => {
  it("should provide parent and children pointers", () => {
    const aID = 100;
    const bID = 88;
    const cID = 103;
    const unrelatedID = 1000;
    const collection = [
      cast(OrganizationDTO, {
        id: aID,
        name: "A (Root)",
      }),
      cast(OrganizationDTO, {
        id: bID,
        name: "B",
        parentId: aID,
      }),
      cast(OrganizationDTO, {
        id: cID,
        name: "C",
        parentId: bID,
      }),
      cast(OrganizationDTO, {
        id: unrelatedID,
        name: "Unrelated",
        parentId: aID,
      }),
      // Reverse to ensure order doesn't matter.
    ].reverse();

    const tree = new Tree<OrganizationDTO>(collection);
    const root = tree.root;
    expect(root.v.id).toEqual(aID);

    expect(root.children.map((x) => x.v.id).sort()).toEqual(
      [bID, unrelatedID].sort(),
    );

    const c = tree.getById(cID);
    expect(c.parent?.parent?.v.id).toEqual(aID);
  });
});
