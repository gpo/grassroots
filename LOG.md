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
npm install ts-jest-resolver --save

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
