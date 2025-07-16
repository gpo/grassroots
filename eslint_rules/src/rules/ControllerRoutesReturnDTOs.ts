import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { createRule } from "../Utils.js";
import { RuleContext, RuleListener } from "@typescript-eslint/utils/ts-eslint";

type MessageIds = "controllerRoutesReturnDTOs";
type Context = Readonly<RuleContext<MessageIds, []>>;

function handleMethodDefinition(
  element:
    | TSESTree.MethodDefinitionComputedName
    | TSESTree.MethodDefinitionNonComputedName,
  context: Context,
): void {
  if (element.kind !== "method") {
    return;
  }
  const type = element.value.returnType?.typeAnnotation;
  if (!type) {
    return;
  }
  // If a controller method returns a raw DTO, we're good.
  // Otherwise, fail.
  if (type.type === AST_NODE_TYPES.TSTypeReference) {
    const typeName = type.typeName;
    if (typeName.type == AST_NODE_TYPES.Identifier) {
      const typeNameString = typeName.name;
      if (typeNameString.includes("DTO")) {
        return;
      }
    }
  }
  context.report({
    messageId: "controllerRoutesReturnDTOs",
    node: element,
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
        const isController = /Controller/i.exec(name);
        if (!isController) {
          return;
        }

        for (const element of node.body.body) {
          switch (element.type) {
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
      description: "Ensure Controller routes always return DTOs.",
      recommended: true,
      requiresTypeChecking: true,
    },
    messages: {
      controllerRoutesReturnDTOs: `Controller routes should always return a DTO. If you want to return an array or primitive type, wrap it in a DTO.`,
    },
    type: "suggestion",
    schema: [],
  },
  name: "controller-routes-return-dtos",
  defaultOptions: [],
});
