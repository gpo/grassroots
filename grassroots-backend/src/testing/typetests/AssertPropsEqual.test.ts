import { expect } from "tstyche";
import { AssertPropsEqual } from "@grassroots/shared";
import { describe, it } from "vitest";

describe("assertPropsEqual", () => {
  it("should allow equal types", () => {
    class A {
      a!: number;
    }
    class B {
      a!: number;
    }
    expect<AssertPropsEqual<A, B>>().type.toBe<true>();
  });

  it("should throw a type error if the properties don't match exactly", () => {
    class A {
      a?: number;
    }
    class B {
      a!: number;
    }
    expect<AssertPropsEqual<A, B>>().type.toBe<never>();
  });

  it("should throw a type error if one class has an extra optional field", () => {
    class A {
      a?: number;
      b?: number;
    }
    class B {
      a?: number;
    }
    expect<AssertPropsEqual<A, B>>().type.toBe<never>();
  });
});
