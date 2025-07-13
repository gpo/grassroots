import { RuleTester } from "@typescript-eslint/rule-tester";

import { ESLintUtils } from "@typescript-eslint/utils";
import path from "path";
import tseslint from "typescript-eslint";
import * as vitest from "vitest";

export interface ExampleTypedLintingRuleDocs {
  description: string;
  recommended?: boolean;
  requiresTypeChecking?: boolean;
}

export const createRule = ESLintUtils.RuleCreator<ExampleTypedLintingRuleDocs>(
  (name) =>
    `https://github.com/typescript-eslint/examples/tree/main/eslint-plugin-example-typed-linting/docs/${name}.md`,
);

export function createRuleTester(): RuleTester {
  RuleTester.afterAll = vitest.afterAll;
  RuleTester.it = vitest.it;
  RuleTester.itOnly = vitest.it.only;
  RuleTester.describe = vitest.describe;

  const ruleTester = new RuleTester({
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: {
          allowDefaultProject: ["*.ts*"],
          defaultProject: "tsconfig.json",
        },
        tsconfigRootDir: path.join(__dirname, ".."),
      },
    },
  });

  return ruleTester;
}
