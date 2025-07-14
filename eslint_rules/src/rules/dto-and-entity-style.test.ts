import { rule } from "./dto-and-entity-style.js";
import { createRuleTester } from "../test-utils.js";

const ruleTester = createRuleTester();

ruleTester.run("definite-or-optional", rule, {
  valid: [
    `class FooDTO extends createBrandedClass("FooDTO") { a!: number; b?: number}`,
    `class FooDTO extends createBrandedClass("FooDTO") { a!: number}`,
    `class FooDTO extends createBrandedClass("FooDTO") { a?: number}`,
    `class Foo extends createBrandedClass("FooDTO") { a: number}`,
    `class Foo extends createBrandedClass("FooDTO") { a = 2}`,
    `class FooEntity extends createBrandedEntity("UserEntity") { a = 2}`,
  ],
  invalid: [
    {
      code: `class FooDTO extends createBrandedClass("FooDTO") { a: number}`,
      errors: [
        {
          messageId: "definiteOrOptional",
        },
      ],
    },
    {
      code: `class FooDto extends createBrandedClass("FooDTO") { a!: number}`,
      errors: [
        {
          messageId: "classNameRules",
        },
      ],
    },
    {
      code: `class FooDTOMagic extends createBrandedClass("FooDTO") { a!: number}`,
      errors: [
        {
          messageId: "classNameRules",
        },
      ],
    },

    {
      code: `class FooDTO extends createBrandedClass("FooDTO") {
        a!: number;
        constructor(a: number) {
          this.a = a;
        }
      }`,
      errors: [
        {
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
    {
      code: `class FooEntity extends createBrandedClass("FooEntity") {
        a!: number;
      }`,
      errors: [
        {
          messageId: "missingEntityBaseClass",
        },
      ],
    },
    {
      code: `class FooDTO {
        a!: number;
      }`,
      errors: [
        {
          messageId: "missingDTOBrand",
        },
      ],
    },
  ],
});
