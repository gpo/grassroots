import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { createRule } from "../utils.js";
import {
  RuleContext,
  RuleFix,
  RuleListener,
} from "@typescript-eslint/utils/ts-eslint";

type MessageIds =
  | "definiteOrOptional"
  | "classNameRules"
  | "noConstructors"
  | "missingEntityBaseClass"
  | "invalidDTOBaseClass"
  | "fixInvalidDTOBaseClass";
type Context = Readonly<RuleContext<MessageIds, []>>;

function handlePropertyDefinition(
  element:
    | TSESTree.PropertyDefinitionComputedName
    | TSESTree.PropertyDefinitionNonComputedName,
  context: Context,
): void {
  if (!element.definite && !element.optional && !element.value) {
    context.report({
      messageId: "definiteOrOptional",
      node: element,
    });
  }
}

function handleMethodDefinition(
  element:
    | TSESTree.MethodDefinitionComputedName
    | TSESTree.MethodDefinitionNonComputedName,
  context: Context,
): void {
  if (!("name" in element.key)) {
    return;
  }
  if (element.key.name === "constructor") {
    context.report({
      messageId: "noConstructors",
      node: element,
    });
  }
}

/*
function verifyEntitySuperclass(
  node: TSESTree.ClassDeclaration,
  context: Context,
): void {
  if (getSuperclassCalleeName(node) === "createEntityBase") {
    return;
  }
  context.report({
    messageId: "missingEntityBaseClass",
    node,
  });
}*/

interface SuperclassDetails {
  valid: boolean;
  desiredName: string;
}

function evaluateDTOSuperclass(
  node: TSESTree.ClassDeclaration,
  className: string,
): SuperclassDetails {
  const superClass = node.superClass;
  const desiredName = className.slice(0, -3);

  const ret = {
    valid: false,
    desiredName,
  };

  if (superClass?.type !== AST_NODE_TYPES.CallExpression) {
    return ret;
  }

  const callee = superClass.callee;
  if (callee.type !== AST_NODE_TYPES.Identifier) {
    return ret;
  }

  if (callee.name !== "createDTOBase") {
    return ret;
  }

  const firstParam = superClass.arguments[0];

  if (firstParam === undefined) {
    return ret;
  }

  if (firstParam.type !== AST_NODE_TYPES.Literal) {
    return ret;
  }

  if (firstParam.value != desiredName) {
    return ret;
  }
  ret.valid = true;
  return ret;
}

export const rule = createRule({
  create(context: Context): RuleListener {
    return {
      ClassDeclaration(node: TSESTree.ClassDeclaration): undefined {
        const identifier = node.id;
        if (identifier === null) {
          return;
        }
        const name = identifier.name;
        const isDTO = /dto/i.exec(name);
        const isEntity = /entity/i.exec(name);
        if (!isDTO && !isEntity) {
          return;
        }
        // We need to match case sensitively, and DTO / Entity should be at the end of the class name.
        if (!/(DTO|Entity)$/.exec(name)) {
          context.report({
            messageId: "classNameRules",
            node,
          });
          // Ideally we might process more issues at once, but future rules depend on heuristics around
          // naming that don't hold at this point, so we just bail.
          return;
        }
        if (isEntity) {
          //verifyEntitySuperclass(node, context);
        }
        if (isDTO) {
          const superClassDetails = evaluateDTOSuperclass(node, name);
          if (!superClassDetails.valid) {
            context.report({
              messageId: "invalidDTOBaseClass",
              node,
              suggest: [
                {
                  messageId: "fixInvalidDTOBaseClass",
                  data: { desiredName: superClassDetails.desiredName },
                  fix: (fixer): RuleFix => {
                    const classNameEnd = identifier.range[1];
                    const bodyStart = node.body.range[0];
                    return fixer.replaceTextRange(
                      [classNameEnd, bodyStart],
                      ` extends createDTOBase("${superClassDetails.desiredName}") `,
                    );
                  },
                },
              ],
            });
          }
        }
        for (const element of node.body.body) {
          switch (element.type) {
            case AST_NODE_TYPES.PropertyDefinition:
              handlePropertyDefinition(element, context);
              break;
            case AST_NODE_TYPES.MethodDefinition:
              handleMethodDefinition(element, context);
              break;
            default:
              break;
          }
        }
      },
    };
  },
  meta: {
    docs: {
      description: "Ensure DTO's follow our style guide.",
      recommended: true,
      requiresTypeChecking: true,
    },
    hasSuggestions: true,
    messages: {
      definiteOrOptional: `Properties must be definite (with a ! suffix) or optional (with a ? suffix).
        Since these objects are constructed via class-transformer, they won't be initialized in the constructor.
        This lets typescript know that it can assume they're present despite this.`,
      classNameRules: `DTOs and Entity class names must end in DTO or Entity, case sensitive`,
      noConstructors: `DTOs and Entities shouldn't have constructors. These constructors can be called
      after class-transformer has already populated some fields, resulting in confusing results. Create
      these objects via class-tranformer's plainToInstance`,
      missingEntityBaseClass: `All entities should extend createEntityBase.`,
      invalidDTOBaseClass: `All DTOs should extend createDTOBase, with the string parameter of their class name, without the DTO suffix.`,
      fixInvalidDTOBaseClass: `Make this class extend createDTOBase("{{desiredName}}")`,
    },
    type: "suggestion",
    schema: [],
  },
  name: "dto-and-entity-style",
  defaultOptions: [],
});
