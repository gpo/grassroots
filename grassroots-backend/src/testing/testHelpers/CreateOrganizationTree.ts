import { OrganizationDTO } from "../../grassroots-shared/Organization.dto";
import { E2ETestFixture } from "../E2eSetup";

// Creating these trees manually is pretty painful, and makes it harder to understand the
// point of the test.

interface OrganizationTreeNode {
  name: string;
  children?: OrganizationTreeNode[];
}

interface CreateOrganizationTreeResult {
  nameToId: Map<string, number>;
}

function mergeNameToIdMap(
  into: Map<string, number>,
  from: Map<string, number>,
): void {
  for (const [key, value] of from) {
    if (into.has(key)) {
      throw new Error(`Duplicate organization names in tree: ${String(key)}`);
    }
    into.set(key, value);
  }
}

export async function createOrganizationTree(
  f: E2ETestFixture,
  currentNode: OrganizationTreeNode,
  parentID?: number,
): Promise<CreateOrganizationTreeResult> {
  let currentNodeId: number | undefined;
  const nameToId = new Map<string, number>();

  // First we make the current node, then we recurse on the children.
  if (parentID === undefined) {
    const root = OrganizationDTO.fromFetchOrThrow(
      await f.grassrootsAPI.POST("/organizations/create-root", {
        body: {
          name: currentNode.name,
        },
      }),
    );
    currentNodeId = root.id;
  } else {
    const node = OrganizationDTO.fromFetchOrThrow(
      await f.grassrootsAPI.POST("/organizations", {
        body: {
          name: currentNode.name,
          parentID,
        },
      }),
    );
    currentNodeId = node.id;
  }

  nameToId.set(currentNode.name, currentNodeId);

  for (const child of currentNode.children ?? []) {
    const nameToIdMapExtention = await createOrganizationTree(
      f,
      child,
      currentNodeId,
    );
    mergeNameToIdMap(nameToId, nameToIdMapExtention.nameToId);
  }
  return { nameToId };
}
