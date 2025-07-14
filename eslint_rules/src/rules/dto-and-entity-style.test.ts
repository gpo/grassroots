import { rule } from "./dto-and-entity-style.js";
import { createRuleTester } from "../test-utils.js";

const ruleTester = createRuleTester();

ruleTester.run("definite-or-optional", rule, {
  valid: [
    `class FooDTO { a!: number; b?: number}`,
    `class FooDTO { a!: number}`,
    `class FooDTO { a?: number}`,
    `class Foo { a: number}`,
    `class Foo { a = 2}`,
    `class FooEntity extends createBrandedEntity("UserEntity") { a = 2}`,
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

    {
      code: `class FooDTO {
        a!: number;
        constructor(a: number) {
          this.a = a;
        }
      }`,
      errors: [
        {
          column: 9,
          endColumn: 10,
          line: 3,
          endLine: 5,
          messageId: "noConstructors",
        },
      ],
    },
    {
      code: `class FooEntity {
        a!: number;
      }`,
      errors: [
        {
          messageId: "missingEntityBaseClass",
        },
      ],
    },
  ],
});
