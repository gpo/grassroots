// TODO (https://github.com/gpo/grassroots/issues/233): this and other
// tests for grassroots-shared should move into grassroots-backend.

import { createDTOBase } from "grassroots-shared/util/CreateDTOBase";
import { describe, expect, it } from "vitest";

class AConvertable {
  a!: string;
  toDTO(): void {
    this.a = "converted";
  }
  constructor() {
    this.a = "unconverted";
  }
}

class BConvertable {
  b!: string;
  toDTO(): void {
    this.b = "converted";
  }
  constructor() {
    this.b = "unconverted";
  }
}

class TestDTO extends createDTOBase("Test") {
  a!: AConvertable;
  b!: BConvertable;
  aArray!: AConvertable[];
}

describe("cast", () => {
  it("from should call toDTO when appropriate", () => {
    const r = TestDTO.from({
      a: new AConvertable(),
      b: new BConvertable(),
      aArray: [new AConvertable(), new AConvertable(), { a: "unconverted" }],
    });
    expect(r).toEqual(
      TestDTO.from({
        a: {
          a: "converted",
        },
        b: {
          b: "converted",
        },
        aArray: [{ a: "converted" }, { a: "converted" }, { a: "unconverted" }],
      }),
    );
  });
});
