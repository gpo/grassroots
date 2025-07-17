import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESTree,
} from "@typescript-eslint/utils";

export interface ExampleTypedLintingRuleDocs {
  description: string;
  recommended?: boolean;
  requiresTypeChecking?: boolean;
}

export const createRule = ESLintUtils.RuleCreator<ExampleTypedLintingRuleDocs>(
  (name) =>
    `https://github.com/typescript-eslint/examples/tree/main/eslint-plugin-example-typed-linting/docs/${name}.md`,
);

interface TypeInfo {
  name: string;
  reference: TSESTree.TSTypeReference;
}

export function getTypeInfo(node: TSESTree.TypeNode): TypeInfo | undefined {
  if (node.type === AST_NODE_TYPES.TSTypeReference) {
    const typeName = node.typeName;
    if (typeName.type == AST_NODE_TYPES.Identifier) {
      return {
        name: typeName.name,
        reference: node,
      };
    }
  }
}
