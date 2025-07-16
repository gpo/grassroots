import { describe, expect, it } from "vitest";
import { PropsOf } from "../grassroots-shared/util/PropsOf";

const __brand: unique symbol = Symbol();

class Branded<TBrand> {
  readonly [__brand]!: TBrand;
  next?: Branded<TBrand>;
}

describe("propsOf", () => {
  it("should exclude brands", () => {
    const x: PropsOf<Branded<"foo">> = { next: undefined };
    expect(x.next).toStrictEqual(undefined);
  });

  it("should support nested types", () => {
    const x: PropsOf<Branded<"foo">> = { next: { next: undefined } };
    expect(x.next).toStrictEqual({ next: undefined });
  });

  it("should support array of union type", () => {
    class ArrayOfUnion {
      x: ("a" | "b" | "c")[] = [];
    }
    const x: PropsOf<ArrayOfUnion> = { x: ["a", "b"] };
    expect(x.x).toStrictEqual(["a", "b"]);
  });
});
