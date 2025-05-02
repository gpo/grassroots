import { IsNumber, Min } from "class-validator";
import { cast, castWithConversion } from "../grassroots-shared/cast";

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

describe("castWithConversion", () => {
  it("Type converting cast works", () => {
    const testCasted = castWithConversion(Test, { a: "2" });
    expect(testCasted).toEqual(new Test(2));
  });

  it("Type converting cast can fail validation", () => {
    expect(() => castWithConversion(Test, { a: "-2" })).toThrow(Error);
  });
});
