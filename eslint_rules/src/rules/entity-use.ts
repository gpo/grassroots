import { TSESTree } from "@typescript-eslint/utils";

import { createRule } from "../utils.js";
import { RuleContext, RuleListener } from "@typescript-eslint/utils/ts-eslint";

type MessageIds = "noEntityAccessOutsideServices";
type Context = Readonly<RuleContext<MessageIds, []>>;

function checkEntityFilename(
  node: TSESTree.VariableDeclaration,
  context: Context,
): void {
  if (
    !context.filename.includes("service") &&
    !context.filename.includes("entity")
  ) {
    context.report({
      messageId: "noEntityAccessOutsideServices",
      node: node,
    });
  }
}

export const rule = createRule({
  create(context: Context): RuleListener {
    return {
      VariableDeclaration(node: TSESTree.VariableDeclaration): undefined {
        for (const declaration of node.declarations) {
          const typeAnnotation = declaration.id.typeAnnotation?.typeAnnotation;
          if (
            typeAnnotation?.type !== TSESTree.AST_NODE_TYPES.TSTypeReference
          ) {
            continue;
          }
          const typeName = typeAnnotation.typeName;
          if (typeName.type !== TSESTree.AST_NODE_TYPES.Identifier) {
            continue;
          }
          if (!/.*Entity$/.exec(typeName.name)) {
            continue;
          }
          checkEntityFilename(node, context);
        }
      },
    };
  },
  meta: {
    docs: {
      description: "Ensure Entities are only used where appropriate.",
      recommended: true,
      requiresTypeChecking: true,
    },
    messages: {
      noEntityAccessOutsideServices: `Entity usage should only occur within services. Outside services, we should use the DTOs.`,
    },
    type: "suggestion",
    schema: [],
  },
  name: "entity-use",
  defaultOptions: [],
});
