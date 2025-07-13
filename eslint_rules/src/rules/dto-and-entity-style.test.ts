import path from "node:path";
import tseslint from "typescript-eslint";
import { RuleTester } from "@typescript-eslint/rule-tester";
import * as vitest from "vitest";

import { rule } from "./dto-and-entity-style.js";

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
      tsconfigRootDir: path.join(__dirname, "../.."),
    },
  },
});

ruleTester.run("definite-or-optional", rule, {
  valid: [
    `class FooDTO { a!: number; b?: number}`,
    `class FooDTO { a!: number}`,
    `class FooDTO { a?: number}`,
    `class Foo { a: number}`,
    `class Foo { a = 2}`,
  ],
  invalid: [
    {
      code: `class FooDTO { a: number}`,
      errors: [
        {
          column: 16,
          endColumn: 25,
          line: 1,
          endLine: 1,
          messageId: "definiteOrOptional",
        },
      ],
    },
    {
      code: `class FooDto { a!: number}`,
      errors: [
        {
          column: 1,
          endColumn: 27,
          line: 1,
          endLine: 1,
          messageId: "classNameRules",
        },
      ],
    },
    {
      code: `class FooDTOMagic { a!: number}`,
      errors: [
        {
          column: 1,
          endColumn: 32,
          line: 1,
          endLine: 1,
          messageId: "classNameRules",
        },
      ],
    },
  ],
});
