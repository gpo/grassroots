import { rule } from "./DTOAndEntityStyle.js";
import { createRuleTester } from "../TestUtils.js";

const ruleTester = createRuleTester();

ruleTester.run("definite-or-optional", rule, {
  valid: [
    `class FooDTO extends createDTOBase("Foo") { a!: number; b?: number}`,
    `class FooDTO extends createDTOBase("Foo") { a!: number}`,
    `class FooDTO extends createDTOBase("Foo") { a?: number}`,
    `class Foo extends createDTOBase("Foo") { a: number}`,
    `class Foo extends createDTOBase("Foo") { a = 2}`,
    `class FooEntity extends createEntityBase<"Foo", FooDTO>("Foo") { a = 2}`,
  ],
  invalid: [
    {
      code: `class FooDTO extends createDTOBase("Foo") { a: number}`,
      errors: [
        {
          messageId: "definiteOrOptional",
        },
      ],
    },
    {
      code: `class FooDto extends createDTOBase("Foo") { a!: number}`,
      errors: [
        {
          messageId: "classNameRules",
        },
      ],
    },
    {
      code: `class FooDTOMagic extends createDTOBase("Foo") { a!: number}`,
      errors: [{ messageId: "classNameRules" }],
    },

    {
      code: `class FooDTO extends createDTOBase("Foo") {
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
      code: `
class FooEntity {
  a!: number;
}`,
      errors: [
        {
          messageId: "invalidEntityBaseClass",
          suggestions: [
            {
              output: `
class FooEntity extends createEntityBase<"Foo", FooDTO>("Foo") {
  a!: number;
}`,
              messageId: "fixInvalidEntityBaseClass",
            },
          ],
        },
      ],
    },
    {
      code: `
class FooEntity extends createDTOBase("Foo") {
  a!: number;
}`,
      errors: [
        {
          messageId: "invalidEntityBaseClass",
          suggestions: [
            {
              output: `
class FooEntity extends createEntityBase<"Foo", FooDTO>("Foo") {
  a!: number;
}`,
              messageId: "fixInvalidEntityBaseClass",
            },
          ],
        },
      ],
    },
    {
      code: `
class FooEntity extends createEntityBase<"Foo", WrongDTO>("Foo") {
  a!: number;
}`,
      errors: [
        {
          messageId: "invalidEntityBaseClass",
          suggestions: [
            {
              output: `
class FooEntity extends createEntityBase<"Foo", FooDTO>("Foo") {
  a!: number;
}`,
              messageId: "fixInvalidEntityBaseClass",
            },
          ],
        },
      ],
    },
    {
      code: `
class FooEntity extends createEntityBase("Foo") {
  a!: number;
}`,
      errors: [
        {
          messageId: "invalidEntityBaseClass",
          suggestions: [
            {
              output: `
class FooEntity extends createEntityBase<"Foo", FooDTO>("Foo") {
  a!: number;
}`,
              messageId: "fixInvalidEntityBaseClass",
            },
          ],
        },
      ],
    },
    {
      code: `
class FooDTO {
  a!: number;
}`,
      errors: [
        {
          messageId: "invalidDTOBaseClass",
          suggestions: [
            {
              output: `
class FooDTO extends createDTOBase("Foo") {
  a!: number;
}`,
              messageId: "fixInvalidDTOBaseClass",
            },
          ],
        },
      ],
    },
    {
      code: `
class FooDTO extends createDTOBase("FooDTO"){
  a!: number;
}`,
      errors: [
        {
          messageId: "invalidDTOBaseClass",
          suggestions: [
            {
              output: `
class FooDTO extends createDTOBase("Foo") {
  a!: number;
}`,
              messageId: "fixInvalidDTOBaseClass",
            },
          ],
        },
      ],
    },
  ],
});
