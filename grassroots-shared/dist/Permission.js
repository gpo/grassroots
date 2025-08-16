import { AbilityBuilder, createMongoAbility } from "@casl/ability";
export var Permission = /*#__PURE__*/ function(Permission) {
    Permission["VIEW_CONTACTS"] = "VIEW_CONTACTS";
    Permission["MANAGE_CONTACTS"] = "MANAGE_CONTACTS";
    Permission["MANAGE_USERS"] = "MANAGE_USERS";
    return Permission;
}({});
export function permissionsToCaslAbilities(user, activeOrganizationId, permissions) {
    var _ref = new AbilityBuilder(createMongoAbility), can = _ref.can, cannot = _ref.cannot, build = _ref.build;
    void cannot;
    can("read", "User", {
        id: user.id
    });
    var PERMISSIONS_TO_CASL_RULES = {
        VIEW_CONTACTS: function() {
            can("read", "Contact", {
                organizationId: activeOrganizationId
            });
        },
        MANAGE_CONTACTS: function() {
            can("edit", "Contact");
        },
        MANAGE_USERS: function() {
            can("edit", "User");
        }
    };
    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
    try {
        for(var _iterator = permissions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
            var permission = _step.value;
            PERMISSIONS_TO_CASL_RULES[permission]();
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
    return build({
        detectSubjectType: function(obj) {
            return obj.__caslSubjectType;
        }
    });
}
