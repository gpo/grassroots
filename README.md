# grassroots

Political Campaign Software focused on voter outreach and volunteer management.

# Setup

1. Run setup.sh

2. Add

```
$LOCAL_IP grassroots.local
```

to your /etc/hosts.

That's:

```
127.0.0.1 grassroots.local
```

if you're developing on the machine you're browsing from.

3. if you're on Windows and are getting the error: /usr/local/bin/docker-entrypoint.sh: no such file or directory

```
dos2unix docker/docker-entrypoint.sh
```

4. Run mikro-orm migration inside docker dev container (WIP)

```
docker compose exec grassroots_dev bash -c "cd grassroots-back
end && npx mikro-orm migration:up"
```

# Running in Dev Mode

We're running things in docker.

### On Mac:

```sh
cd docker
docker compose up
docker compose exec grassroots_dev /bin/bash -c "cd grassroots-frontend && npm run dev" # Frontend
docker compose exec grassroots_dev /bin/bash -c "cd grassroots-backend && npm run start:dev" # Backend
```

### On Windows:

1. Start up Docker

2. Terminal 1: (git bash)

```
cd docker
docker compose build grassroots_dev
docker compose up
```

3. Terminals 2 & 3: (git bash)

```
cd docker && docker compose exec grassroots_dev bash -c "cd grassroots-frontend && npm run dev" #Frontend
cd docker && docker compose exec grassroots_dev bash -c "cd grassroots-backend && npm run start:dev" #Backend
```

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
