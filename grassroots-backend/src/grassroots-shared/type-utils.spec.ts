import { cast } from "./type-utils";

describe("cast", () => {
  it('should cast in the basic case"', () => {
    class Test {
      x!: number;
      y(): number {
        return 0;
      }
    }
    const test = cast(Test, { x: 2 });
    expect(test).toHaveProperty("x");
    expect(test).toHaveProperty("y");
  });
});
