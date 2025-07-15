import { rule } from "./entity-use.js";
import { createRuleTester } from "../test-utils.js";

const ruleTester = createRuleTester();

ruleTester.run("entity-use", rule, {
  valid: [
    {
      filename: "foo.entity.ts",
      code: `let x: FooEntity = y;`,
    },
    {
      filename: "foo.controller.ts",
      code: `let em:EntityManager;`,
    },
  ],
  invalid: [
    {
      filename: "foo.controller.ts",
      code: `let x: FooEntity = y;`,
      errors: [
        {
          column: 8,
          endColumn: 17,
          line: 1,
          endLine: 1,
          messageId: "noEntityAccessOutsideServices",
        },
      ],
    },
    {
      filename: "foo.controller.ts",
      code: `console.log(x as FooEntity);`,
      errors: [
        {
          column: 18,
          endColumn: 27,
          line: 1,
          endLine: 1,
          messageId: "noEntityAccessOutsideServices",
        },
      ],
    },
  ],
});
