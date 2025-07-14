import { BaseEntity } from "@mikro-orm/core";

export const __brand: unique symbol = Symbol();

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export abstract class Branded<TBrand> extends BaseEntity {
  readonly [__brand]!: TBrand;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-unused-vars
export function createBrandedEntity<TBrand extends string>(brand: TBrand) {
  return Branded<TBrand>;
}
