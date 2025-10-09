import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

import { createRule } from "../Utils.js";
import {
  RuleContext,
  RuleFix,
  RuleListener,
} from "@typescript-eslint/utils/ts-eslint";

type MessageIds =
  | "definiteOrOptional"
  | "classNameRules"
  | "noConstructors"
  | "invalidEntityBaseClass"
  | "fixInvalidEntityBaseClass"
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

interface EvaluateSuperclassOptions {
  classDeclarationNode: TSESTree.ClassDeclaration;
  classIdentifier: TSESTree.Identifier;
  baseName: string;
  desiredCalleeName: "createDTOBase" | "createEntityBase";
  desiredGenericParams?: [string, string];
}

function isSuperclassValid(options: EvaluateSuperclassOptions): boolean {
  const superClass = options.classDeclarationNode.superClass;

  if (superClass?.type !== AST_NODE_TYPES.CallExpression) {
    return false;
  }

  const callee = superClass.callee;
  if (
    callee.type !== AST_NODE_TYPES.Identifier ||
    callee.name !== options.desiredCalleeName
  ) {
    return false;
  }

  const firstParam = superClass.arguments[0];

  if (
    firstParam?.type !== AST_NODE_TYPES.Literal ||
    firstParam.value != options.baseName
  ) {
    return false;
  }

  if (options.desiredGenericParams) {
    const params = superClass.typeArguments?.params;
    if (!params) {
      return false;
    }
    if (options.desiredGenericParams.length != params.length) {
      return false;
    }
    for (let i = 0; i < params.length; ++i) {
      const param = params[i];
      const targetGenericParam = options.desiredGenericParams[i];
      let paramIsValid = false;
      if (
        param?.type === AST_NODE_TYPES.TSLiteralType &&
        param.literal.type == AST_NODE_TYPES.Literal &&
        param.literal.raw == targetGenericParam
      ) {
        paramIsValid = true;
      } else if (param?.type === AST_NODE_TYPES.TSTypeReference) {
        const typeName = param.typeName;
        if ("name" in typeName && typeName.name == targetGenericParam) {
          paramIsValid = true;
        }
      }
      if (!paramIsValid) {
        return false;
      }
    }
  }

  return true;
}

interface FixSuperclassOptions {
  context: Context;
  errorMessageId: MessageIds;
  fixMessageId: MessageIds;
}

function evaluateAndFixSuperclass(
  options: EvaluateSuperclassOptions,
  fixOptions: FixSuperclassOptions,
): void {
  if (isSuperclassValid(options)) {
    return;
  }
  const genericParamsStr = options.desiredGenericParams
    ? `<${options.desiredGenericParams.join(", ")}>`
    : "";
  fixOptions.context.report({
    messageId: fixOptions.errorMessageId,
    node: options.classIdentifier,
    suggest: [
      {
        messageId: fixOptions.fixMessageId,
        data: { baseName: options.baseName },
        fix: (fixer): RuleFix => {
          const classNameEnd = options.classIdentifier.range[1];
          const bodyStart = options.classDeclarationNode.body.range[0];
          return fixer.replaceTextRange(
            [classNameEnd, bodyStart],
            ` extends ${options.desiredCalleeName}${genericParamsStr}("${options.baseName}") `,
          );
        },
      },
    ],
  });
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
        // Case insensitive since FooDto and FooDTO both seem reasonable.
        const isDTO = /dto/i.exec(name);
        // Case sensitive to avoid false positives like FooIdentityDTO.
        const isEntity = /Entity/.exec(name);
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
        const baseName = identifier.name.slice(
          0,
          isDTO ? -"DTO".length : -"Entity".length,
        );
        if (isEntity) {
          evaluateAndFixSuperclass(
            {
              classDeclarationNode: node,
              classIdentifier: identifier,
              baseName,
              desiredCalleeName: "createEntityBase",
              desiredGenericParams: [`"${baseName}"`, baseName + "DTO"],
            },
            {
              context,
              errorMessageId: "invalidEntityBaseClass",
              fixMessageId: "fixInvalidEntityBaseClass",
            },
          );
        }
        if (isDTO) {
          evaluateAndFixSuperclass(
            {
              classDeclarationNode: node,
              classIdentifier: identifier,
              baseName,
              desiredCalleeName: "createDTOBase",
            },
            {
              context,
              errorMessageId: "invalidDTOBaseClass",
              fixMessageId: "fixInvalidDTOBaseClass",
            },
          );
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
      invalidDTOBaseClass: `All DTOs should extend createDTOBase, with the string parameter of their class name, without the DTO suffix.`,
      fixInvalidDTOBaseClass: `Make this class extend createDTOBase("{{baseName}}")`,
      invalidEntityBaseClass: `All Entities should extend createEntityBase, with the appropriate parameters.`,
      fixInvalidEntityBaseClass: `Make this class extend createEntityBase<...>(... appropriate params)`,
    },
    type: "suggestion",
    schema: [],
  },
  name: "dto-and-entity-style",
  defaultOptions: [],
});
