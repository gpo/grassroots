/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */ /* This file contains inline tests and justifications, as there's a lot of subtle decisions,
   and this makes the file a bit easier to understand. In general, we prefer to have
   tests in separate files, but due to the nature of this logic, we make an exception here. */ function _class_call_check(instance, Constructor) {
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
function TestAndJustifyIsAssignableTo() {}
function TestIf() {}
function TestEquals() {}
function TestGetArrayItemType() {}
function TestIsArray() {}
function TestPropsOf() {
    var WrapperWithMethod = /*#__PURE__*/ function() {
        "use strict";
        function WrapperWithMethod() {
            _class_call_check(this, WrapperWithMethod);
            _define_property(this, "optional", void 0);
            _define_property(this, "required", void 0);
            _define_property(this, "default", void 0);
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            this.default = "foo";
        }
        _create_class(WrapperWithMethod, [
            {
                key: "f",
                value: function f() {
                    console.log("Foo");
                }
            }
        ]);
        return WrapperWithMethod;
    }();
    var Nested = function Nested() {
        "use strict";
        _class_call_check(this, Nested);
        _define_property(this, "x", void 0);
    };
}
export { };
