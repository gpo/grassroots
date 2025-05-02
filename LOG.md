# Tanstack Query

Brought Tanstack Query into the frontend, based on the quickstart [here](https://tanstack.com/query/latest/docs/framework/react/quick-start).

# Environment Variables

Switched the format of env files to what Vite wants: .env.development and .env.production.
To expose environment variables to the frontend, they must be prefixed with VITE\_, and added to vite-env.d.ts.

# Generating typescript fetch bindings.

Use @nestjs/swagger to generate OpenAPI bindings, following [these instructions](https://docs.nestjs.com/openapi/introduction), followed by [these instructions](https://docs.nestjs.com/openapi/cli-plugin) for setting up the CLI plugin, which automatically adds the appropriate default decorators.

Then use openapi-typescript (setup instructions)[https://openapi-ts.dev/introduction] and openapi-fetch (setup instructions)[https://openapi-ts.dev/openapi-fetch/].

# Pulling in TypeORM

Going with postgres (pg).
Docker compose from [here](https://hub.docker.com/_/postgres).

A few notes:

- Use of rolled back transactions in tests seems to be best practice, but IDs appear to increment in rolled back transactions.
- We've switched to running all tests sequentially, which will be bad for test performance on devices with a reasonable core count. Eventually we should try to reparallelize these.

# Installing Tanstack Router

Followed [these instructions](https://tanstack.com/router/latest/docs/framework/react/quick-start).

# Installing Mantine

Followed [these instructions](https://mantine.dev/guides/vite/).

# Bootstrapping Vite

```sh
npm create vite@latest # typescript + SWC
```

# Generate Contacts Resource

```sh
cd grassroots-backend
npx nest generate resource contacts # Rest, generate entry points.
```

# Bootstrapping Nest

Shortly we'll move the environment into docker, but to bootstrap, we'll just install the nest CLI globally.

```sh
npm i -g @nestjs/cli
nest new grassroots-backend # selected npm as package manager
```
