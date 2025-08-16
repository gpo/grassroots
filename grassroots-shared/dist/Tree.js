function _check_private_redeclaration(obj, privateCollection) {
    if (privateCollection.has(obj)) {
        throw new TypeError("Cannot initialize the same private elements twice on an object");
    }
}
function _class_apply_descriptor_get(receiver, descriptor) {
    if (descriptor.get) {
        return descriptor.get.call(receiver);
    }
    return descriptor.value;
}
function _class_apply_descriptor_set(receiver, descriptor, value) {
    if (descriptor.set) {
        descriptor.set.call(receiver, value);
    } else {
        if (!descriptor.writable) {
            throw new TypeError("attempted to set read only private field");
        }
        descriptor.value = value;
    }
}
function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _class_extract_field_descriptor(receiver, privateMap, action) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to " + action + " private field on non-instance");
    }
    return privateMap.get(receiver);
}
function _class_private_field_get(receiver, privateMap) {
    var descriptor = _class_extract_field_descriptor(receiver, privateMap, "get");
    return _class_apply_descriptor_get(receiver, descriptor);
}
function _class_private_field_init(obj, privateMap, value) {
    _check_private_redeclaration(obj, privateMap);
    privateMap.set(obj, value);
}
function _class_private_field_set(receiver, privateMap, value) {
    var descriptor = _class_extract_field_descriptor(receiver, privateMap, "set");
    _class_apply_descriptor_set(receiver, descriptor, value);
    return value;
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
var Node = /*#__PURE__*/ function() {
    "use strict";
    function Node(tree, v) {
        _class_call_check(this, Node);
        _define_property(this, "v", void 0);
        _define_property(this, "tree", void 0);
        this.tree = tree;
        this.v = v;
    }
    _create_class(Node, [
        {
            key: "parent",
            get: function get() {
                return this.tree.getParentOf(this.v);
            }
        },
        {
            key: "children",
            get: function get() {
                return this.tree.getChildrenOf(this.v);
            }
        }
    ]);
    return Node;
}();
var // We expliclty verify that this is assigned in the constructor.
_root = /*#__PURE__*/ new WeakMap(), _idMap = /*#__PURE__*/ new WeakMap(), // Map from parent ID to its children.
_parentIdMap = /*#__PURE__*/ new WeakMap();
export var Tree = /*#__PURE__*/ function() {
    "use strict";
    function Tree(vs) {
        _class_call_check(this, Tree);
        _class_private_field_init(this, _root, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _idMap, {
            writable: true,
            value: new Map()
        });
        _class_private_field_init(this, _parentIdMap, {
            writable: true,
            value: new Map()
        });
        var rootAssigned = false;
        var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
        try {
            for(var _iterator = vs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                var v = _step.value;
                _class_private_field_get(this, _idMap).set(v.id, v);
                if (v.parentId === undefined) {
                    _class_private_field_set(this, _root, v);
                    rootAssigned = true;
                    continue;
                }
                var _class_private_field_get_get;
                var existing = (_class_private_field_get_get = _class_private_field_get(this, _parentIdMap).get(v.parentId)) !== null && _class_private_field_get_get !== void 0 ? _class_private_field_get_get : [];
                existing.push(v);
                _class_private_field_get(this, _parentIdMap).set(v.parentId, existing);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally{
            try {
                if (!_iteratorNormalCompletion && _iterator.return != null) {
                    _iterator.return();
                }
            } finally{
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
        if (!rootAssigned) {
            throw new Error("Missing root");
        }
    }
    _create_class(Tree, [
        {
            key: "getParentOf",
            value: function getParentOf(v) {
                if (v.parentId == undefined) {
                    return undefined;
                }
                var parent = _class_private_field_get(this, _idMap).get(v.parentId);
                if (parent === undefined) {
                    return undefined;
                }
                return new Node(this, parent);
            }
        },
        {
            key: "getChildrenOf",
            value: function getChildrenOf(v) {
                var _this = this;
                var children = _class_private_field_get(this, _parentIdMap).get(v.id);
                var _children_map;
                return (_children_map = children === null || children === void 0 ? void 0 : children.map(function(x) {
                    return new Node(_this, x);
                })) !== null && _children_map !== void 0 ? _children_map : [];
            }
        },
        {
            key: "getById",
            value: function getById(id) {
                var v = _class_private_field_get(this, _idMap).get(id);
                if (v === undefined) {
                    throw new Error("Invalid ID");
                }
                return new Node(this, v);
            }
        },
        {
            key: "root",
            get: function get() {
                return new Node(this, _class_private_field_get(this, _root));
            }
        }
    ]);
    return Tree;
}();
