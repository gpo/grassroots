import { BaseEntity } from "@mikro-orm/core";

// See CreateBrandedClass.ts for details on why branding is important.
// This is equivalent to CreateBrandedClass, except that it also extends BaseEntity.

export const __brand: unique symbol = Symbol();

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createEntityBase<TBrand extends string, TDTO>(brand: TBrand) {
  abstract class Branded extends BaseEntity {
    readonly [__brand]!: `${TBrand}Entity`;

    static get __caslSubjectType__(): string {
      return brand;
    }

    abstract toDTO(): TDTO;
  }
  return Branded;
}
