import { describe, expect, it } from "vitest";
import * as MaybeLoaded from "./MaybeLoaded";

function toMaybeLoadedForTest<T>(x: T): MaybeLoaded.MaybeLoaded<T> {
  return x;
}

describe("MaybeLoaded", () => {
  it("should work for single values", () => {
    const maybe = toMaybeLoadedForTest(1);
    let isLoaded = false;
    if (MaybeLoaded.isLoaded(maybe)) {
      isLoaded = true;
      // @ts-expect-error the type guard should prevent this.
      if (maybe === "unloaded") {
        throw new Error("type narrowing should prevent this branch.");
      }
    }
    expect(isLoaded).toBe(true);
  });

  it("should see an undefined value as loaded", () => {
    let maybe = toMaybeLoadedForTest(1);
    maybe = undefined;

    expect(MaybeLoaded.isLoaded(maybe)).toBe(true);
  });

  it("should see an unloaded value as unloaded", () => {
    let maybe = toMaybeLoadedForTest(1);
    maybe = "unloaded";

    expect(MaybeLoaded.isLoaded(maybe)).toBe(false);
  });

  it("should support map", () => {
    const maybe = toMaybeLoadedForTest({ x: 1 });
    expect(
      MaybeLoaded.map(maybe, (x) => {
        return {
          y: x.x,
        };
      }),
    ).toStrictEqual({ y: 1 });
  });

  it("should support map items", () => {
    const maybe = toMaybeLoadedForTest([{ x: 1 }]);
    expect(
      MaybeLoaded.mapItems(maybe, (x) => {
        return {
          y: x.x,
        };
      }),
    ).toStrictEqual([{ y: 1 }]);
  });
});
