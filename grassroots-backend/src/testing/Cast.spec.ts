import { IsNumber, Min } from "class-validator";
import { cast } from "../grassroots-shared/Cast";
import { describe, expect, it } from "vitest";

class Test {
  @IsNumber()
  @Min(0)
  a!: number;

  constructor(a: number) {
    this.a = a;
  }
}

describe("cast", () => {
  it("should cast in the trival case", () => {
    expect(cast(Test, { a: 2 })).toEqual(new Test(2));
  });

  it("should be able to fail validation", () => {
    expect(() => cast(Test, { a: -3 })).toThrow(Error);
  });
});
