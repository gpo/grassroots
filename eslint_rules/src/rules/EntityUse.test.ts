import { rule } from "./EntityUse";
import { createRuleTester } from "../TestUtils";

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
          messageId: "noEntityAccessOutsideServices",
        },
      ],
    },
    {
      filename: "foo.controller.ts",
      code: `console.log(x as FooEntity);`,
      errors: [
        {
          messageId: "noEntityAccessOutsideServices",
        },
      ],
    },
  ],
});
