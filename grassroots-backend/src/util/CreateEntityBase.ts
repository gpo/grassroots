import { BaseEntity, OptionalProps, Property } from "@mikro-orm/core";
import type { Opt } from "@mikro-orm/core";

// Re-export OptionalProps to prevent issues with exporting class using private name.
export { OptionalProps };

// See CreateDTOBase.ts for details on why branding is important.
// This is equivalent to CreateDTOBase, except that it also extends BaseEntity.

// Sadly, in this case, we can't get typescript to infer the type of TBrand, so
// using this is a bit repetitive.
// e.g., class FooEntity extends createEntityBase<"Foo", FooDTO>("Foo") {}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function createEntityBase<TBrand extends string, TDTO>(
  brand: TBrand,
  // eslint-disable-next-line grassroots/entity-use
): abstract new () => BaseEntity & {
  readonly __entityBrand: Opt<`${TBrand}Entity`>;
  readonly __caslSubjectType: Opt<string>;
  toDTO(): TDTO;
} {
  abstract class Branded extends BaseEntity {
    @Property({ persist: false })
    // We need different names for our branding types
    // between entities or DTOs, or we get some type collicions.
    readonly __entityBrand!: Opt<`${TBrand}Entity`>;
    // Used for CASL to identify object types.
    @Property({ persist: false })
    readonly __caslSubjectType: Opt<string> = brand;
    abstract toDTO(): TDTO;
  }
  return Branded;
}
