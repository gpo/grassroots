const __brand: unique symbol = Symbol();

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-unused-vars
export function createBrandedClass<TBrand extends string>(brand: TBrand) {
  abstract class Branded {
    readonly [__brand]!: TBrand;
  }
  return Branded;
}
