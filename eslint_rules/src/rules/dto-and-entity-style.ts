import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { createRule } from "../utils.js";
import { RuleContext, RuleListener } from "@typescript-eslint/utils/ts-eslint";

type MessageIds = "definiteOrOptional";

export const rule = createRule({
  create(context: Readonly<RuleContext<MessageIds, []>>): RuleListener {
    return {
      ClassDeclaration(node: TSESTree.ClassDeclaration): undefined {
        const name = node.id?.name;
        if (name === undefined) {
          return;
        }
        if (!/(DTO|Entity)/.exec(name)) {
          return;
        }
        for (const element of node.body.body) {
          if (element.type !== AST_NODE_TYPES.PropertyDefinition) {
            continue;
          }
          if (!element.definite && !element.optional) {
            context.report({
              messageId: "definiteOrOptional",
              node: element,
            });
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
    },
    type: "suggestion",
    schema: [],
  },
  name: "dto-and-entity-style",
  defaultOptions: [],
});
