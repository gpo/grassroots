import { RuleTester } from "@typescript-eslint/rule-tester";
import path from "path";
import tseslint from "typescript-eslint";
import * as vitest from "vitest";

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
