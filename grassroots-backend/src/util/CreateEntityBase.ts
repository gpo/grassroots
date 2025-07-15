import { BaseEntity } from "@mikro-orm/core";

// See CreateBrandedClass.ts for details on why branding is important.
// This is equivalent to CreateBrandedClass, except that it also extends BaseEntity.

const __brand: unique symbol = Symbol();

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export abstract class Branded<TBrand, TDTO> extends BaseEntity {
  readonly [__brand]!: TBrand;

  abstract toDTO(): TDTO;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createEntityBase<TBrand extends string, TDTO>() {
  return Branded<TBrand, TDTO>;
}
