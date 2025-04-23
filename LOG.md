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