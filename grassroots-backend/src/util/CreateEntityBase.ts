import { BaseEntity, Opt, OptionalProps, Property } from "@mikro-orm/core";

// Re-export OptionalProps to prevent issues with exporting class using private name.
export { OptionalProps };

// See CreateDTOBase.ts for details on why branding is important.
// This is equivalent to CreateDTOBase, except that it also extends BaseEntity.

// Sadly, in this case, we can't get typescript to infer the type of TBrand, so
// using this is a bit repetitive.
// e.g., class FooEntity extends createEntityBase<"Foo", FooDTO>("Foo") {}

// We don't explicitly type this function because it's super gnarly.
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createEntityBase<TBrand extends string, TDTO>(brand: TBrand) {
  abstract class Branded extends BaseEntity {
    @Property({ persist: false })
    // We need different names for our branding types
    // between entities or DTOs, or we get some type collicions.
    readonly __entityBrand!: Opt<`${TBrand}Entity`>;
    // Used for CASL to identify object types.

    @Property({ persist: false })
    readonly __caslSubjectType: Opt<TBrand> = brand;
    static readonly __caslSubjectTypeStatic: TBrand = brand;
    abstract toDTO(): TDTO;
  }
  return Branded;
}
