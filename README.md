# Grassroots

Political Campaign Software focused on voter outreach and volunteer management.

# Setup

Run `setup.sh`.
Update `grassroots-backend/src/grassroots-shared/local-constants.ts` with your local IP.

If you use vscode, grab the [recommended](.vscode/extensions.json) extensions, for eslint and prettier.

# Running in Dev Mode

You'll need to access via your local IP, not localhost. This will change as part of fixing auth.

There are three pieces to Grassroots. You can start everything with `npm run dev` in the root, or separately:

1. Frontend: `cd grassroots-frontend; npm run dev`
2. Backend: `cd grassroots-backend; npm run start:dev`
3. Docker (Postgres and Supertokens (for auth)): `cd docker; docker compose up`.

Because type checking is done separately from compilation when using swc, it's sometimes easy to miss type errors. Similarly, it's easy to miss eslint errors that aren't caught by vscode. To check all files, use `npm run check`.

# Architecture and Nomenclature

We use Nest for our backend, and TypeORM for a database ORM.

There are three special attributes Classes can have in this setup. Every Class instance may be a:

- Data Transfer Object (DTOs) used in requests
- DTO used in responses
- Entity understood by TypeORM

For consistency and brevity, I propose the following class name suffixes:

- InDTO or InDTOEntity
- OutDTO or OutDTOEntity
- DTO or DTOEntity (if the class is used for both requests and responses)

To gives a class these attributes, we use decorators:

- InDTO and OutDTO: [@APIProperty](https://docs.nestjs.com/openapi/types-and-parameters), but this is automatically [added](https://docs.nestjs.com/openapi/cli-plugin) by the NestJS CLI Plugin to all files with suffixes: '.dto.ts' and '.entity.ts'.
- InDTO: [Class-validator](https://github.com/typestack/class-validator?tab=readme-ov-file#usage) validation decorators, such as @IsInt.
- Entity: The [`@Entity`](https://orkhan.gitbook.io/typeorm/docs/decorator-reference#entity) decorator, and [friends](https://orkhan.gitbook.io/typeorm/docs/decorator-reference).

Note that only Classes can have these attributes, Interfaces (since they don't exist at runtime) can't be used.

# Style Rules for Entities and DTOs

## One Class per Set of Fields

To maximize the separation of concerns, it's tempting to always make separate classes for InDTOs, OutDTOs, and Entities. I've found this results in a mess of too many classes though.

Let's try using a single class per unique set of fields. Note that this is for DTOs and Entities only, which are shared between the frontend and backend. If we need frontend or backend specific functionality on these objects, we can have additional classes for those purposes (possibly extending the DTO/Entity classes).

## No constructors

Constructors often serve to enforce invariants, but these objects are often automatically constructed via `class-transformer`, not via constructors. To ensure these objects are created consistently, let's just always make them via `class-transformer`, applying the `class-validation` validator (via the `cast` method in [type-utils.ts](grassroots-backend/src/grassroots-shared/type-utils.ts)).

## No inheritance or generics: only composition

`@nestjs/swagger` uses a bunch of magic to produce OpenAPI schemas, and that magic works best if we only rely on composition. There are ways to use inheritance and generics, but they're generally more complicated.

Sticking to a single method for combining objects will also result in a more consistent codebase, which will be easier to reason about.

## Only synchronous validators

Validation via class-validator can be done asynchronously in some cases (e.g., they can run arbitrary async functions). That restricts our ability to use validation in some use-cases which expect synchrnous validation, so let's avoid async validators.

# Use of Type Information

The Entities and DTOs we define are used consistently across the frontend and backend.

We'll use [PaginatedContactSearchInDTO and ContactSearchInDTO](grassroots-frontend/src/grassroots-shared/contact.dto.entity.ts) as an example.

```js
export class ContactSearchInDTO {
  @IsInt()
  @Min(0)
  id?: number;
  ...
}

export class PaginatedContactSearchInDTO {
  @ValidateNested()
  contact!: ContactSearchInDTO;
  @ValidateNested()
  paginated!: PaginatedInDTO;
}
```

## Backend Routes

In [contact.controller.ts](grassroots-backend/src/contact/contact.controller.ts).

```js
@Post('search')
  search(
    @Body() contact: PaginatedContactSearchInDTO,
  ): Promise<PaginatedContactOutDTO> {...}
```

In this example, `contact` is validated and cast to a `PaginatedContactSearchInDTO`.

In [useContactSearch.ts](grassroots-frontend/src/hooks/useContactSearch.ts), we use the type information generated from this controller. The body property passed to `grassrootsAPI.POST()` is a `ContactSearchInDTO` and the response is also strongly typed. This is simplified a bit.

```js
return (
  useQuery <
  PaginatedContactOutDTO >
  {
    queryFn: async () => {
      const result = await grassrootsAPI.POST("/contacts/search", {
        body: searchParams.contact,
      });
      return result.data;
    },
  }
);
```

## Frontend Forms

Note that this both lets us validate the form via the validation decorators, and ensures everything is typed appropriately.

In [search.tsx](grassroots-frontend/src/routes/search.tsx).

```js
const form =
  useForm <
  ContactSearchInDTO >
  {
    resolver: classValidatorResolver(ContactSearchInDTO), ...
  };
```

## Routes

In [shared-search.tsx](grassroots-frontend/src/routes/shared-search.tsx), we define that this route takes search params of type `ContactSearchInDTO`, using `cast` again to perform validation.

Note that it's safe to cast a `Record<string, unknown>` to `ContactSearchInDTO` because all fields of `ContactSearchInDTO` are optional.

```js
export const Route = createFileRoute('/shared-search')({
  ...
  validateSearch: (search: Record<string, unknown>): ContactSearchInDTO => {
    return cast(ContactSearchInDTO, search);
  },
});
```

Then in [search.tsx](grassroots-frontend/src/routes/search.tsx), we have a link where the search parameter is strongly typed. Here, `search` is of type `ContactSearchInDTO`.

```html
<Link role="button" to="/shared-search" search={searchParams.contact}>
  Share Link to Search
</Link>
```

# Shared Code - why not a monorepo?

Nest [monorepos](https://docs.nestjs.com/cli/monorepo) bring all kinds of unpleasantness. In particular,
it prevents you from using SWC, which on my low powered hardware, took builds from 23 seconds to ~0.5 seconds.

I tried using webpack with the swc-loader, but didn't see the same build improvements. I also struggled to get sourcemaps working with monorepos, and things like the swagger CLI plugin require a bunch of [extra config](https://docs.nestjs.com/recipes/swc#monorepo-and-cli-plugins) to work with monorepos.

However, we do need to share code.
Nest is fussy about all kinds of things, symlinks included, so I've opted to have the
nest project hold the real files, and symlink them into the frontend. This is a bit weird, but
appears to let us share code, will all the benefits of not using a monorepo.

Note that we still need a package.json in the root, for things like eslint and husky.

# Dependencies

## Style validation

We use `prettier` and `eslint` for style validation. To get these run on precommit, we use `husky` (to install the pre-commit hook) and `lint-staged` (to make it easy to only run on files that are going to be commit).

We also use `syncpack` to ensure that packages used in both the frontend and backend are of the same version.

`concurrently` is used to allow some of the pre-commit hooks to run in parallel (and also for the top level `npm run dev`).

## Auth

We use Supertokens, which handles all the session management, frontend and backend.
Supertokens has nice [integration](https://supertokens.com/docs/quickstart/integrations/nestjs#5-manage-authentication-with-decorators) with nest, including authenticaion for roles. From their docs:

```js
@Get('/user/:userId')
@VerifySession({
  roles: ['admin'],
})
async deleteUser(@Session() session: SessionContainer) {}
```

## Other

- `openapi-typescript` to generate typescript request/response bindings.
  - It takes the OpenAPI schema provided by Nests swagger plugin as input.
  - This happens in [main.ts](grassroots-backend/src/main.ts).
- `typeorm` with `postgres` for an ORM / database.
  - We're currently using a single postgres database for both supertokens and everything else. We might want to split these into separate databases (or servers) at some point.
- `react-hook-form` for forms that easily support `class-validator` validation.
- `@faker-js/faker` to generate fake data.
- `@tanstack/react-query` to manage data fetched remotely, with great typing, caching, retrying, etc.
- `@tanstack/react-router` as a router with strong type support.
  - This is probably the most questionable dependency, we could just go with [reactrouter.com](https://reactrouter.com/), but it doesn't support strongly typing search and query params
- `vite` to serve the frontend for development, with hot module reloading, etc.
- `swc`, the "Speedy Web Compiler" instead of webpack, for both frontend and backend.
- `picocss` is a minimal CSS framework.
  - We should probably get rid of pico at some point.
  - It's just being used to make current quick prototypes less ugly.
  - That said, the way it uses semantic styles does encourage good habits: e.g., styling invalid forms based on the aria-invalid property.

# Things that can go wrong

## Syncpack

If we end up depending on two versions of the same package across frontend and backend, then the syncpack pre-commit hook will complain. Often, just running `npx syncpack fix-mismatches` will fix it.

## Can't connect to database

TypeORM will refuse to connect if the schema has changed. The easiest thing to do is completely drop the database and restart everything. This is a bit overly aggressive, but does the job!

```bash
docker compose down -v
docker compose up --force-recreate
```

# FAQs

Q: Why does the frontend depend on TypeORM?
A: It only consumes shim decorators which do nothing, which enables us to share classes which are Entities with the frontend.

# TODO

- Write Tests
- Exclude emails from ContactEntityOutDTO, as those should be hidden.
- Add phone number to contacts, as it's required for the telephony features we want to build.

npm audit fix

npm prune
