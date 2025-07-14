/* Typescript has "structural" typing, which means that two types that are the same shape will be automatically converted.

Consider this example:
```
class Foo {}

class ADTO {
    a!: number
    fooId?: number
}

class AEntity {
    a!:number
    foo?: Foo
}

let aDTO:ADTO = {a:3};
let aEntity: AEntity = aDTO;
```

Typescript allows this, despite it being clearly wrong.
To avoid this, we introduce a compile time only "brand", used
only to convince typescript that these types shouldn't be castable to one another.
*/

const __brand: unique symbol = Symbol();

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export abstract class Branded<TBrand> {
  readonly [__brand]!: TBrand;
}

// The parameter "brand", serves only to set the type of TBrand.
// We don't explicitly type this function because it's super gnarly.
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-unused-vars
export function createBrandedClass<TBrand extends string>(brand: TBrand) {
  return Branded<TBrand>;
}
