# Grassroots eslint rules.

Currently built manually via `pnpm run tsc`.
e.g., from the root, run `pnpm run tsc --prefix eslint_rules && pnpm exec eslint .`.

## Rules

<!-- begin auto-generated rules list -->

💭 Requires [type information](https://typescript-eslint.io/linting/typed-linting).

| Name                                                       | Description                          | 💭  |
| :--------------------------------------------------------- | :----------------------------------- | :-- |
| [dto-and-entity-style](docs/rules/dto-and-entity-style.md) | Ensure DTO's follow our style guide. | 💭  |

<!-- end auto-generated rules list -->

### Docs

Run `pnpm run docs` to auto generate documentation.

### Testing

This example uses [Vitest](https://vitest.dev):

```shell
pnpm run test
```

Note that files don't need to have been built to the `lib` directory to run tests.
