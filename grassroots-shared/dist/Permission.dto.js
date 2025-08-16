function _assert_this_initialized(self) {
    if (self === void 0) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
}
function _call_super(_this, derived, args) {
    derived = _get_prototype_of(derived);
    return _possible_constructor_return(_this, _is_native_reflect_construct() ? Reflect.construct(derived, args || [], _get_prototype_of(_this).constructor) : derived.apply(_this, args));
}
function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
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
function _get_prototype_of(o) {
    _get_prototype_of = Object.setPrototypeOf ? Object.getPrototypeOf : function getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _get_prototype_of(o);
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            writable: true,
            configurable: true
        }
    });
    if (superClass) _set_prototype_of(subClass, superClass);
}
function _possible_constructor_return(self, call) {
    if (call && (_type_of(call) === "object" || typeof call === "function")) {
        return call;
    }
    return _assert_this_initialized(self);
}
function _set_prototype_of(o, p) {
    _set_prototype_of = Object.setPrototypeOf || function setPrototypeOf(o, p) {
        o.__proto__ = p;
        return o;
    };
    return _set_prototype_of(o, p);
}
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
function _is_native_reflect_construct() {
    try {
        var result = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
    } catch (_) {}
    return (_is_native_reflect_construct = function() {
        return !!result;
    })();
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
import { IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { applyDecorators } from "@nestjs/common";
import { createDTOBase } from "./util/CreateDTOBase.js";
// This enum is only used for generating OpenAPI docs.
// See PermissionsDecorator.
var PermissionEnum = /*#__PURE__*/ function(PermissionEnum) {
    PermissionEnum["VIEW_CONTACTS"] = "VIEW_CONTACTS";
    PermissionEnum["MANAGE_CONTACTS"] = "MANAGE_CONTACTS";
    PermissionEnum["MANAGE_USERS"] = "MANAGE_USERS";
    return PermissionEnum;
}(PermissionEnum || {});
export function PermissionsDecorator() {
    return applyDecorators(IsEnum(PermissionEnum, {
        each: true
    }), ApiProperty({
        enum: PermissionEnum,
        isArray: true
    }));
}
export var PermissionsDTO = /*#__PURE__*/ function(_createDTOBase) {
    "use strict";
    _inherits(PermissionsDTO, _createDTOBase);
    function PermissionsDTO() {
        _class_call_check(this, PermissionsDTO);
        var _this;
        _this = _call_super(this, PermissionsDTO, arguments), _define_property(_this, "permissions", void 0);
        return _this;
    }
    return PermissionsDTO;
}(createDTOBase("Permissions"));
_ts_decorate([
    PermissionsDecorator()
], PermissionsDTO.prototype, "permissions", void 0);
