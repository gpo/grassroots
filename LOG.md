# Pulling in TypeORM

Going with postgres (pg).
Docker compose from [here](https://hub.docker.com/_/postgres).

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
