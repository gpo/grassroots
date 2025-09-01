import { createRuleTester } from "../TestUtils.js";
import { rule } from "./ControllerRoutesReturnDTOs.js";

const ruleTester = createRuleTester();

ruleTester.run("controller-routes-return-dtos", rule, {
  valid: [
    `class FooDTO { a():number { return 5;}}`,
    `class FooController { a():FooDTO { return x;}}`,
    `class FooController { async a():Promise<FooDTO> { return await getX();}}`,
  ],
  invalid: [
    {
      code: `class FooController { a(): number { return 5;}}`,
      errors: [
        {
          messageId: "controllerRoutesReturnDTOs",
        },
      ],
    },
    {
      code: `class FooController { a(): FooDTO[] { return x;}}`,
      errors: [
        {
          messageId: "controllerRoutesReturnDTOs",
        },
      ],
    },
    {
      code: `class FooController {
        async a():Promise<FooDTO[]> {
          return await getX();
        }
      }`,
      errors: [
        {
          messageId: "controllerRoutesReturnDTOs",
        },
      ],
    },
  ],
});
