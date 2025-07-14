import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { createRule } from "../utils.js";
import { RuleContext, RuleListener } from "@typescript-eslint/utils/ts-eslint";

type MessageIds =
  | "definiteOrOptional"
  | "classNameRules"
  | "noConstructors"
  | "missingEntityBaseClass"
  | "missingDTOBrand";
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

function getSuperclassCalleeName(
  node: TSESTree.ClassDeclaration,
): string | null {
  const superClass = node.superClass;

  if (superClass?.type !== AST_NODE_TYPES.CallExpression) {
    return null;
  }

  const callee = superClass.callee;
  if (callee.type !== AST_NODE_TYPES.Identifier) {
    return null;
  }
  return callee.name;
}

function verifyEntitySuperclass(
  node: TSESTree.ClassDeclaration,
  context: Context,
): void {
  if (getSuperclassCalleeName(node) === "createBrandedEntity") {
    return;
  }
  context.report({
    messageId: "missingEntityBaseClass",
    node,
  });
}

function verifyDTOSuperclass(
  node: TSESTree.ClassDeclaration,
  context: Context,
): void {
  if (getSuperclassCalleeName(node) === "createBrandedClass") {
    return;
  }
  context.report({
    messageId: "missingDTOBrand",
    node,
  });
}

export const rule = createRule({
  create(context: Context): RuleListener {
    return {
      ClassDeclaration(node: TSESTree.ClassDeclaration): undefined {
        const name = node.id?.name;
        if (name === undefined) {
          return;
        }
        const isDTO = /dto/i.exec(name);
        const isEntity = /entity/i.exec(name);
        if (!isDTO && !isEntity) {
          return;
        }
        if (isEntity) {
          verifyEntitySuperclass(node, context);
        }
        if (isDTO) {
          verifyDTOSuperclass(node, context);
        }
        // We need to match case sensitively, and DTO / Entity should be at the end of the class name.
        if (!/(DTO|Entity)$/.exec(name)) {
          context.report({
            messageId: "classNameRules",
            node,
          });
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
    messages: {
      definiteOrOptional: `Properties must be definite (with a ! suffix) or optional (with a ? suffix).
        Since these objects are constructed via class-transformer, they won't be initialized in the constructor.
        This lets typescript know that it can assume they're present despite this.`,
      classNameRules: `DTOs and Entity class names must end in DTO or Entity, case sensitive`,
      noConstructors: `DTOs and Entities shouldn't have constructors. These constructors can be called
      after class-transformer has already populated some fields, resulting in confusing results. Create
      these objects via class-tranformer's plainToInstance`,
      missingEntityBaseClass: `All entities should extend createBrandedEntity.`,
      missingDTOBrand: `All DTOs should extend createBrandedClass`,
    },
    type: "suggestion",
    schema: [],
  },
  name: "dto-and-entity-style",
  defaultOptions: [],
});
