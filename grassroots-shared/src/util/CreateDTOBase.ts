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
import { PropsOf } from "./TypeUtils.js";
import { HttpException } from "@nestjs/common";

export interface FetchResponse<T, E> {
  data?: T;
  error?: E;
  response: Response;
}

interface DTOConvertible {
  toDTO(): unknown;
}

function hasToDTO(value: unknown): value is DTOConvertible {
  return (
    value !== null &&
    typeof value === "object" &&
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    typeof (value as any).toDTO === "function"
  );
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

    // This lets us easily construct DTOs from a mixture of explicit values and entities.
    // We magically convert entities to DTOs at runtime. This isn't reflected in the type signature,
    // which is mostly okay because entities and DTOs typically have similar properties.
    // Raw properties are just passed to class-transformer to produce an instance of the target DTO class.
    static from<T extends Branded>(
      // The this parameter must be named "this", and is magically populated with the class constructor.
      this: new () => T,
      props: PropsOf<T>,
    ): T {
      const entitiesConvertedToDTOs: Record<string, unknown> = {};

      for (const [k, v] of Object.entries(props)) {
        if (hasToDTO(v)) {
          entitiesConvertedToDTOs[k] = v.toDTO();
        } else if (Array.isArray(v)) {
          entitiesConvertedToDTOs[k] = v.map((item) =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            hasToDTO(item) ? item.toDTO() : item,
          );
        } else {
          entitiesConvertedToDTOs[k] = v;
        }
      }

      return plainToInstance(this, entitiesConvertedToDTOs);
    }

    static fromFetchOrThrow<T extends Branded, E>(
      this: new () => T,
      fetchResult: FetchResponse<PropsOf<T>, E>,
    ): T {
      if (fetchResult.response.ok) {
        return plainToInstance(this, fetchResult.data);
      }
      throw new HttpException(
        fetchResult.response.statusText,
        fetchResult.response.status,
        {
          cause: new Error(JSON.stringify(fetchResult.error, null, 2)),
        },
      );
    }
  }
  return Branded;
}
