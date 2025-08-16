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
*/ function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
import { plainToInstance } from "class-transformer";
import { HttpException } from "@nestjs/common";
// We don't explicitly type this function because it's super gnarly.
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createDTOBase(brand) {
    var Branded = /*#__PURE__*/ function() {
        "use strict";
        function Branded() {
            _class_call_check(this, Branded);
            // We need different names for our branding types
            // between entities or DTOs, or we get some type collisions.
            _define_property(this, "__DTOBrand", void 0);
            // Used for CASL to identify object types.
            _define_property(this, "__caslSubjectType", brand);
        }
        _create_class(Branded, null, [
            {
                key: "from",
                value: function from(props) {
                    return plainToInstance(this, props);
                }
            },
            {
                key: "fromFetchOrThrow",
                value: function fromFetchOrThrow(fetchResult) {
                    if (fetchResult.response.ok) {
                        return plainToInstance(this, fetchResult.data);
                    }
                    throw new HttpException(fetchResult.response.statusText, fetchResult.response.status, {
                        cause: new Error(JSON.stringify(fetchResult.error, null, 2))
                    });
                }
            }
        ]);
        return Branded;
    }();
    _define_property(Branded, "__caslSubjectTypeStatic", brand);
    return Branded;
}
