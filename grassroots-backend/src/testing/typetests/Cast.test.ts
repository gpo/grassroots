import * as tstyche from "tstyche";
import { cast } from "../../grassroots-shared/util/Cast";
import { IsNumber, Min } from "class-validator";
import { describe, it } from "vitest";

class Test {
  @IsNumber()
  @Min(0)
  a!: number;

  constructor(a: number) {
    this.a = a;
  }
}

describe("cast", () => {
  it("should cast in the trivial case", () => {
    const testCasted = cast(Test, { a: 2 });
    tstyche.expect(testCasted).type.toBe<Test>();
  });

  it("should throw a type error if the properties don't overlap", () => {
    tstyche
      .expect(cast(Test, { b: 3 }))
      .type.toRaiseError("does not exist in type");
  });

  it("should throw a type error if the types don't overlap", () => {
    tstyche
      .expect(cast(Test, { a: "2" }))
      .type.toRaiseError("is not assignable to type");
  });
});
