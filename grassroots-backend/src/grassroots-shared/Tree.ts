interface NodeRequirements {
  id: number;
  parentId?: number;
}

class Node<T extends NodeRequirements> {
  v: T;
  tree: Tree<T>;

  constructor(tree: Tree<T>, v: T) {
    this.tree = tree;
    this.v = v;
  }

  get parent(): Node<T> | undefined {
    return this.tree.getParentOf(this.v);
  }

  get children(): Node<T>[] {
    return this.tree.getChildrenOf(this.v);
  }
}

export class Tree<T extends NodeRequirements> {
  // We expliclty verify that this is assigned in the constructor.
  #root!: T;
  #idMap = new Map<number, T>();
  // Map from parent ID to its children.
  #parentIdMap = new Map<number, T[]>();

  constructor(vs: T[]) {
    let rootAssigned = false;
    for (const v of vs) {
      this.#idMap.set(v.id, v);
      if (v.parentId === undefined) {
        this.#root = v;
        rootAssigned = true;
        continue;
      }
      const existing = this.#parentIdMap.get(v.parentId) ?? [];
      existing.push(v);
      this.#parentIdMap.set(v.parentId, existing);
    }

    if (!rootAssigned) {
      throw new Error("Missing root");
    }
  }

  getParentOf(v: T): Node<T> | undefined {
    if (v.parentId == undefined) {
      return undefined;
    }
    const parent = this.#idMap.get(v.parentId);
    if (parent === undefined) {
      return undefined;
    }
    return new Node<T>(this, parent);
  }

  getChildrenOf(v: T): Node<T>[] {
    const children = this.#parentIdMap.get(v.id);
    return children?.map((x) => new Node(this, x)) ?? [];
  }

  getById(id: number): Node<T> {
    const v = this.#idMap.get(id);
    if (v === undefined) {
      throw new Error("Invalid ID");
    }

    return new Node(this, v);
  }

  get root(): Node<T> {
    return new Node(this, this.#root);
  }
}
