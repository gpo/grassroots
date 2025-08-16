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
import { Transform, Type } from "class-transformer";
import { IsArray, IsEmail, IsInt, IsNotEmpty, IsOptional, IsPhoneNumber, Min, ValidateNested } from "class-validator";
import { PaginatedRequestDTO, PaginatedResponseDTO } from "./Paginated.dto.js";
import "reflect-metadata";
import { createDTOBase } from "./util/CreateDTOBase.js";
import { OrganizationDTO } from "./Organization.dto.js";
export var ContactDTO = /*#__PURE__*/ function(_createDTOBase) {
    "use strict";
    _inherits(ContactDTO, _createDTOBase);
    function ContactDTO() {
        _class_call_check(this, ContactDTO);
        var _this;
        _this = _call_super(this, ContactDTO, arguments), _define_property(_this, "id", void 0), _define_property(_this, "email", void 0), _define_property(_this, "firstName", void 0), _define_property(_this, "lastName", void 0), _define_property(_this, "organization", void 0), _define_property(_this, "organizationId", void 0), _define_property(_this, "phoneNumber", void 0);
        return _this;
    }
    return ContactDTO;
}(createDTOBase("Contact"));
_ts_decorate([
    IsInt(),
    Min(1)
], ContactDTO.prototype, "id", void 0);
_ts_decorate([
    IsEmail()
], ContactDTO.prototype, "email", void 0);
_ts_decorate([
    IsNotEmpty()
], ContactDTO.prototype, "firstName", void 0);
_ts_decorate([
    IsNotEmpty()
], ContactDTO.prototype, "lastName", void 0);
_ts_decorate([
    IsNotEmpty(),
    Type(function() {
        return OrganizationDTO;
    }),
    ValidateNested()
], ContactDTO.prototype, "organization", void 0);
_ts_decorate([
    IsInt(),
    Min(1)
], ContactDTO.prototype, "organizationId", void 0);
_ts_decorate([
    IsPhoneNumber("CA")
], ContactDTO.prototype, "phoneNumber", void 0);
export var ContactsDTO = /*#__PURE__*/ function(_createDTOBase) {
    "use strict";
    _inherits(ContactsDTO, _createDTOBase);
    function ContactsDTO() {
        _class_call_check(this, ContactsDTO);
        var _this;
        _this = _call_super(this, ContactsDTO, arguments), _define_property(_this, "contacts", void 0);
        return _this;
    }
    return ContactsDTO;
}(createDTOBase("Contacts"));
_ts_decorate([
    Type(function() {
        return ContactDTO;
    }),
    ValidateNested({
        each: true
    }),
    IsArray()
], ContactsDTO.prototype, "contacts", void 0);
export var CreateContactRequestDTO = /*#__PURE__*/ function(_createDTOBase) {
    "use strict";
    _inherits(CreateContactRequestDTO, _createDTOBase);
    function CreateContactRequestDTO() {
        _class_call_check(this, CreateContactRequestDTO);
        var _this;
        _this = _call_super(this, CreateContactRequestDTO, arguments), _define_property(_this, "email", void 0), _define_property(_this, "firstName", void 0), _define_property(_this, "lastName", void 0), _define_property(_this, "phoneNumber", void 0), _define_property(_this, "organizationId", void 0);
        return _this;
    }
    return CreateContactRequestDTO;
}(createDTOBase("CreateContactRequest"));
_ts_decorate([
    IsEmail()
], CreateContactRequestDTO.prototype, "email", void 0);
_ts_decorate([
    IsNotEmpty()
], CreateContactRequestDTO.prototype, "firstName", void 0);
_ts_decorate([
    IsNotEmpty()
], CreateContactRequestDTO.prototype, "lastName", void 0);
_ts_decorate([
    IsPhoneNumber("CA")
], CreateContactRequestDTO.prototype, "phoneNumber", void 0);
_ts_decorate([
    IsInt(),
    Min(-1)
], CreateContactRequestDTO.prototype, "organizationId", void 0);
export var CreateBulkContactRequestDTO = /*#__PURE__*/ function(_createDTOBase) {
    "use strict";
    _inherits(CreateBulkContactRequestDTO, _createDTOBase);
    function CreateBulkContactRequestDTO() {
        _class_call_check(this, CreateBulkContactRequestDTO);
        var _this;
        _this = _call_super(this, CreateBulkContactRequestDTO, arguments), _define_property(_this, "contacts", void 0);
        return _this;
    }
    return CreateBulkContactRequestDTO;
}(createDTOBase("CreateBulkContactRequest"));
_ts_decorate([
    ValidateNested({
        each: true
    }),
    Type(function() {
        return CreateContactRequestDTO;
    })
], CreateBulkContactRequestDTO.prototype, "contacts", void 0);
export var CreateBulkContactResponseDTO = /*#__PURE__*/ function(_createDTOBase) {
    "use strict";
    _inherits(CreateBulkContactResponseDTO, _createDTOBase);
    function CreateBulkContactResponseDTO() {
        _class_call_check(this, CreateBulkContactResponseDTO);
        var _this;
        _this = _call_super(this, CreateBulkContactResponseDTO, arguments), _define_property(_this, "ids", void 0);
        return _this;
    }
    return CreateBulkContactResponseDTO;
}(createDTOBase("CreateBulkContactResponse"));
export var GetContactByIDResponseDTO = /*#__PURE__*/ function(_createDTOBase) {
    "use strict";
    _inherits(GetContactByIDResponseDTO, _createDTOBase);
    function GetContactByIDResponseDTO() {
        _class_call_check(this, GetContactByIDResponseDTO);
        var _this;
        _this = _call_super(this, GetContactByIDResponseDTO, arguments), _define_property(_this, "contact", void 0);
        return _this;
    }
    return GetContactByIDResponseDTO;
}(createDTOBase("GetContactByIDResponse"));
_ts_decorate([
    ValidateNested(),
    IsOptional()
], GetContactByIDResponseDTO.prototype, "contact", void 0);
export var ContactSearchRequestDTO = /*#__PURE__*/ function(_createDTOBase) {
    "use strict";
    _inherits(ContactSearchRequestDTO, _createDTOBase);
    function ContactSearchRequestDTO() {
        _class_call_check(this, ContactSearchRequestDTO);
        var _this;
        _this = _call_super(this, ContactSearchRequestDTO, arguments), _define_property(_this, "id", void 0), _define_property(_this, "email", void 0), _define_property(_this, "firstName", void 0), _define_property(_this, "lastName", void 0), _define_property(_this, "phoneNumber", void 0);
        return _this;
    }
    return ContactSearchRequestDTO;
}(createDTOBase("ContactSearchRequest"));
_ts_decorate([
    IsOptional(),
    Transform(function(param) {
        var value = param.value;
        if (value === "" || value === undefined) {
            return undefined;
        }
        // This happens pre-validation. If "value" can't be turned into a number,
        // NaN is returned, which will violate the "Min(1)" constraint.
        return Number(value);
    }),
    IsInt(),
    Min(1)
], ContactSearchRequestDTO.prototype, "id", void 0);
_ts_decorate([
    IsOptional()
], ContactSearchRequestDTO.prototype, "email", void 0);
_ts_decorate([
    IsOptional()
], ContactSearchRequestDTO.prototype, "firstName", void 0);
_ts_decorate([
    IsOptional()
], ContactSearchRequestDTO.prototype, "lastName", void 0);
_ts_decorate([
    IsOptional()
], ContactSearchRequestDTO.prototype, "phoneNumber", void 0);
export var PaginatedContactSearchRequestDTO = /*#__PURE__*/ function(_createDTOBase) {
    "use strict";
    _inherits(PaginatedContactSearchRequestDTO, _createDTOBase);
    function PaginatedContactSearchRequestDTO() {
        _class_call_check(this, PaginatedContactSearchRequestDTO);
        var _this;
        _this = _call_super(this, PaginatedContactSearchRequestDTO, arguments), _define_property(_this, "contact", void 0), _define_property(_this, "paginated", void 0);
        return _this;
    }
    return PaginatedContactSearchRequestDTO;
}(createDTOBase("PaginatedContactSearchRequest"));
_ts_decorate([
    ValidateNested(),
    Type(function() {
        return ContactSearchRequestDTO;
    })
], PaginatedContactSearchRequestDTO.prototype, "contact", void 0);
_ts_decorate([
    ValidateNested(),
    Type(function() {
        return PaginatedRequestDTO;
    })
], PaginatedContactSearchRequestDTO.prototype, "paginated", void 0);
export var PaginatedContactResponseDTO = /*#__PURE__*/ function(_createDTOBase) {
    "use strict";
    _inherits(PaginatedContactResponseDTO, _createDTOBase);
    function PaginatedContactResponseDTO() {
        _class_call_check(this, PaginatedContactResponseDTO);
        var _this;
        _this = _call_super(this, PaginatedContactResponseDTO, arguments), _define_property(_this, "contacts", void 0), _define_property(_this, "paginated", void 0);
        return _this;
    }
    _create_class(PaginatedContactResponseDTO, null, [
        {
            key: "empty",
            value: function empty() {
                return PaginatedContactResponseDTO.from({
                    contacts: [],
                    paginated: {
                        rowsSkipped: 0,
                        rowsTotal: 0
                    }
                });
            }
        }
    ]);
    return PaginatedContactResponseDTO;
}(createDTOBase("PaginatedContactResponse"));
_ts_decorate([
    ValidateNested({
        each: true
    }),
    Type(function() {
        return ContactDTO;
    }),
    IsArray()
], PaginatedContactResponseDTO.prototype, "contacts", void 0);
_ts_decorate([
    ValidateNested(),
    Type(function() {
        return PaginatedResponseDTO;
    })
], PaginatedContactResponseDTO.prototype, "paginated", void 0);
