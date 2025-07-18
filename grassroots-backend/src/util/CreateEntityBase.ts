import { BaseEntity } from "@mikro-orm/core";

// See CreateDTOBase.ts for details on why branding is important.
// This is equivalent to CreateDTOBase, except that it also extends BaseEntity.

export function createEntityBase<TDTO>() {
  // This type is sufficiently gnarly that it's not worth typing.
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  return function <TBrand extends string>(brand: TBrand) {
    abstract class Branded extends BaseEntity {
      readonly __brand!: `${TBrand}Entity`;
      // Used for CASL to identify object types.
      readonly __caslSubjectType__ = brand;
      abstract toDTO(): TDTO;
    }

    return Branded;
  };
}
