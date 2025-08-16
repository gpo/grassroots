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
import { IsInt, IsNotEmpty, IsNumber, IsOptional, Min, ValidateNested } from "class-validator";
import "reflect-metadata";
import { createDTOBase } from "./util/CreateDTOBase.js";
import { Type } from "class-transformer";
// Until we fully support organizations in the frontend, we just use -1 to mean "make
// sure there's an organization for this contact."
export var TEMPORARY_FAKE_ORGANIZATION_ID = -1;
export var OrganizationDTO = /*#__PURE__*/ function(_createDTOBase) {
    "use strict";
    _inherits(OrganizationDTO, _createDTOBase);
    function OrganizationDTO() {
        _class_call_check(this, OrganizationDTO);
        var _this;
        _this = _call_super(this, OrganizationDTO, arguments), _define_property(_this, "id", void 0), _define_property(_this, "name", void 0), _define_property(_this, "parentId", void 0);
        return _this;
    }
    return OrganizationDTO;
}(createDTOBase("Organization"));
_ts_decorate([
    IsNumber(),
    Min(1),
    Type(function() {
        return Number;
    })
], OrganizationDTO.prototype, "id", void 0);
_ts_decorate([
    IsNotEmpty()
], OrganizationDTO.prototype, "name", void 0);
_ts_decorate([
    IsOptional(),
    IsNumber(),
    Min(1)
], OrganizationDTO.prototype, "parentId", void 0);
export var OrganizationsDTO = /*#__PURE__*/ function(_createDTOBase) {
    "use strict";
    _inherits(OrganizationsDTO, _createDTOBase);
    function OrganizationsDTO() {
        _class_call_check(this, OrganizationsDTO);
        var _this;
        _this = _call_super(this, OrganizationsDTO, arguments), _define_property(_this, "organizations", void 0);
        return _this;
    }
    return OrganizationsDTO;
}(createDTOBase("Organizations"));
_ts_decorate([
    ValidateNested({
        each: true
    }),
    Type(function() {
        return OrganizationDTO;
    })
], OrganizationsDTO.prototype, "organizations", void 0);
export var OrganizationReferenceDTO = /*#__PURE__*/ function(_createDTOBase) {
    "use strict";
    _inherits(OrganizationReferenceDTO, _createDTOBase);
    function OrganizationReferenceDTO() {
        _class_call_check(this, OrganizationReferenceDTO);
        var _this;
        _this = _call_super(this, OrganizationReferenceDTO, arguments), _define_property(_this, "id", void 0);
        return _this;
    }
    return OrganizationReferenceDTO;
}(createDTOBase("OrganizationReference"));
_ts_decorate([
    IsOptional(),
    IsNumber(),
    Min(1)
], OrganizationReferenceDTO.prototype, "id", void 0);
export var CreateOrganizationNoParentRequestDTO = /*#__PURE__*/ function(_createDTOBase) {
    "use strict";
    _inherits(CreateOrganizationNoParentRequestDTO, _createDTOBase);
    function CreateOrganizationNoParentRequestDTO() {
        _class_call_check(this, CreateOrganizationNoParentRequestDTO);
        var _this;
        _this = _call_super(this, CreateOrganizationNoParentRequestDTO, arguments), _define_property(_this, "name", void 0);
        return _this;
    }
    return CreateOrganizationNoParentRequestDTO;
}(createDTOBase("CreateOrganizationNoParentRequest"));
_ts_decorate([
    IsNotEmpty()
], CreateOrganizationNoParentRequestDTO.prototype, "name", void 0);
export var CreateOrganizationRequestDTO = /*#__PURE__*/ function(_createDTOBase) {
    "use strict";
    _inherits(CreateOrganizationRequestDTO, _createDTOBase);
    function CreateOrganizationRequestDTO() {
        _class_call_check(this, CreateOrganizationRequestDTO);
        var _this;
        _this = _call_super(this, CreateOrganizationRequestDTO, arguments), _define_property(_this, "name", void 0), _define_property(_this, "parentID", void 0);
        return _this;
    }
    return CreateOrganizationRequestDTO;
}(createDTOBase("CreateOrganizationRequest"));
_ts_decorate([
    IsNotEmpty()
], CreateOrganizationRequestDTO.prototype, "name", void 0);
_ts_decorate([
    IsInt(),
    Min(1)
], CreateOrganizationRequestDTO.prototype, "parentID", void 0);
