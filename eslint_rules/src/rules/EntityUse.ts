import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { createRule } from "../Utils.js";
import { RuleContext, RuleListener } from "@typescript-eslint/utils/ts-eslint";

type MessageIds = "noEntityAccessOutsideServices";
type Context = Readonly<RuleContext<MessageIds, []>>;

function checkEntityFilename(node: TSESTree.Node, context: Context): void {
  if (
    !context.filename.includes("service") &&
    !context.filename.includes("entity") &&
    !context.filename.includes("repo")
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
      TSTypeReference(node: TSESTree.TSTypeReference): undefined {
        const typeName = node.typeName;
        if (typeName.type !== AST_NODE_TYPES.Identifier) {
          return;
        }
        if (!/.*Entity$/.exec(typeName.name)) {
          return;
        }
        checkEntityFilename(node, context);
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
