import { BaseEntity } from "@mikro-orm/core";

// See CreateBrandedClass.ts for details on why branding is important.
// This is equivalent to CreateBrandedClass, except that it also extends BaseEntity.

const __brand: unique symbol = Symbol();

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
abstract class Branded<TBrand> extends BaseEntity {
  readonly [__brand]!: TBrand;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-unused-vars
export function createBrandedEntity<TBrand extends string>(brand: TBrand) {
  return Branded<TBrand>;
}
