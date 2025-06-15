# grassroots

Political Campaign Software focused on voter outreach and volunteer management.

# Setup

Run setup.sh.
Add

```
$LOCAL_IP grassroots.org
```

to your /etc/hosts.

That's:

```
127.0.0.1 grassroots.org
```

if you're developing on the machine you're browsing from.

# Running in Dev Mode

We're running things in docker.

```sh
cd docker
docker compose up
docker compose exec grassroots_dev /bin/bash -c "cd grassroots-frontend && npm run dev" # Frontend
docker compose exec grassroots_dev /bin/bash -c "cd grassroots-backend && npm run start:dev" # Backend
```

## Environment Variables

Environment variables are read both within and outside the nestJS context (for mikro-orm.config.ts and GlobalSetup.ts). Due to this, we don't inject the ConfigModule for tests, instead, we define a different set of env files for development vs test.

## Migrations

To migrate:

```sh
npx mikro-orm migration:up
```

To create a migration to the current Entity schemas.

```sh
npx mikro-orm migration:create
```

## Frequently Seen Problems

`duplicate key value violates unique constraint "pg_class_relname_nsp_index"`
You're modifying tables from multiple threads at the same time. Serialize whatever you're doing!

`Invalid hook call.`
You might accidentally have installed a dependency in the root package, instead of the frontend package. I'm not sure why this causes this error. Remove the dependency from the root package, `npm prune`, install it in the frontend package, and restart vite.
