# grassroots

Political Campaign Software focused on voter outreach and volunteer management.

# Setup

Run setup.sh.
Add

```
$LOCAL_IP grassroots.local
```

to your /etc/hosts.

That's:

```
127.0.0.1 grassroots.local
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

## Frequently Seen Problems

`duplicate key value violates unique constraint "pg_class_relname_nsp_index"`
You're modifying tables from multiple threads at the same time. Serialize whatever you're doing!

`Invalid hook call.`
You might accidentally have installed a dependency in the root package, instead of the frontend package. I'm not sure why this causes this error. Remove the dependency from the root package, `npm prune`, install it in the frontend package, and restart vite.

## Windows setup

Go to notepad or any text editor run as admin

Open the file found at C:\Windows\System32\drivers\etc\hosts or similar

Add

```
$LOCAL_IP grassroots.local
```

That's:

```
127.0.0.1 grassroots.local
```

alternatively if step above does not work you can go to http://localhost:5173

## Initial Setup

After modifying your hosts file, run the setup script:

```sh
./setup.sh
```

This script will initialize the development environment (must have WSL or git bash this command is POSIX and will not run in ps or cmd)

install docker https://www.docker.com/products/docker-desktop/ (if not already installed)

docker-compose -f docker/compose.yaml up -d db

# Running in Dev Mode

## Backend

```sh
cd grassroots-backend
npm run start:dev
```

## Frontend

```sh
cd grassroots-frontend
npm run dev










```
