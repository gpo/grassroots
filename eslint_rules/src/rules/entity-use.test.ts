import { rule } from "./entity-use.js";
import { createRuleTester } from "../utils.js";

const ruleTester = createRuleTester();

ruleTester.run("entity-use", rule, {
  valid: [
    {
      filename: "foo.entity.ts",
      code: `let x: FooEntity = y;`,
    },
  ],
  invalid: [
    {
      filename: "foo.controller.ts",
      code: `let x: FooEntity = y;`,
      errors: [
        {
          column: 1,
          endColumn: 22,
          line: 1,
          endLine: 1,
          messageId: "noEntityAccessOutsideServices",
        },
      ],
    },
  ],
});
