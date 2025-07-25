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

import { plainToInstance } from "class-transformer";
import { PropsOf } from "./PropsOf";

export interface FetchResponse<T, E> {
  data?: T;
  error?: E;
  response: Response;
}

// We don't explicitly type this function because it's super gnarly.
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createDTOBase<TBrand extends string>(brand: TBrand) {
  abstract class Branded {
    // We need different names for our branding types
    // between entities or DTOs, or we get some type collicions.
    readonly __DTOBrand!: `${TBrand}DTO`;
    // Used for CASL to identify object types.
    readonly __caslSubjectType: string = brand;

    static from<T extends Branded>(
      // The this parameter must be named "this", and is magically populated with the class constructor.
      this: new () => T,
      props: PropsOf<T>,
    ): T {
      return plainToInstance(this, props);
    }

    static fromFetchOrThrow<T extends Branded, E>(
      this: new () => T,
      fetchResult: FetchResponse<PropsOf<T>, E>,
    ): T {
      if (!fetchResult.response.ok) {
        throw new Error(fetchResult.response.statusText);
      }
      if (fetchResult.error !== undefined) {
        throw new Error(JSON.stringify(fetchResult.error));
      }

      return plainToInstance(this, fetchResult.data);
    }
  }
  return Branded;
}
