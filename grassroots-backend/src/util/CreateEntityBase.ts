import { BaseEntity } from "@mikro-orm/core";

// See CreateDTOBase.ts for details on why branding is important.
// This is equivalent to CreateDTOBase, except that it also extends BaseEntity.

// Sadly, in this case, we can't get typescript to infer the type of TBrand, so
// using this is a bit repetitive.
// e.g., class FooEntity extends createEntityBase<"Foo", FooDTO>("Foo") {}

// We don't explicitly type this function because it's super gnarly.
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createEntityBase<TBrand extends string, TDTO>(brand: TBrand) {
  abstract class Branded extends BaseEntity {
    readonly __brand!: `${TBrand}Entity`;
    // Used for CASL to identify object types.
    readonly __caslSubjectType__ = brand;
    abstract toDTO(): TDTO;
  }
  return Branded;
}
