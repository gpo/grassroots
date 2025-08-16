import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { createRule, getTypeInfo } from "../Utils";
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
  // If a controller method returns a raw DTO, or a Promise containing a raw DTO, we're good.
  // Otherwise, fail.
  const typeInfo = getTypeInfo(type);
  if (typeInfo?.name.endsWith("DTO") === true) {
    return;
  }
  if (typeInfo?.name === "Promise") {
    const typeParams = typeInfo.reference.typeArguments?.params;

    const firstTypeParam = typeParams ? typeParams[0] : undefined;
    if (firstTypeParam) {
      const firstTypeParamInfo = getTypeInfo(firstTypeParam);
      if (firstTypeParamInfo?.name.endsWith("DTO") === true) {
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
        const isController = /.*Controller/i.exec(name);
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
