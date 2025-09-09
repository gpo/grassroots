// Use the OrganizationDTO as an example.

import { describe, expect, it } from "vitest";
import { OrganizationDTO } from "../grassroots-shared/Organization.dto.js";
import { Tree } from "../grassroots-shared/Tree.js";

function toOrg(x: {
  id: number;
  name: string;
  parentId?: number;
}): OrganizationDTO {
  return OrganizationDTO.from({
    ...x,
    abbreviatedName: x.name,
    description: x.name,
  });
}

describe("tree", () => {
  it("should provide parent and children pointers", () => {
    const aOrg = { id: 100, name: "A (Root)" };
    const bOrg = { id: 88, name: "B", parentId: aOrg.id };
    const cOrg = { id: 103, name: "C", parentId: bOrg.id };
    const unrelatedOrg = { id: 1000, name: "Unrelated", parentId: aOrg.id };
    const collection = [aOrg, bOrg, cOrg, unrelatedOrg]
      .map((x) => toOrg(x))
      // Reverse to ensure order doesn't matter.
      .reverse();

    const tree = new Tree<OrganizationDTO>(collection);
    const root = tree.root;
    expect(root.v.id).toEqual(aOrg.id);

    expect(root.children.map((x) => x.v.id).sort()).toEqual(
      [bOrg.id, unrelatedOrg.id].sort(),
    );

    const c = tree.getById(cOrg.id);
    expect(c.parent?.parent?.v.id).toEqual(aOrg.id);
  });
});
