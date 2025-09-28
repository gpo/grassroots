# grassroots

Political Campaign Software focused on voter outreach and volunteer
management.

# Note on building:

# Build process

To build everything, run `turbo build`.
For full watch-mode, run `pnpm run watcher` in the root, and `pnpm run start` in grassroots-backend and grassroots-frontend.

# Recommended Development Setup

Install:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git (for cloning the repository)

We're running things in Docker. We can develop our code in a running
Docker container to keep the development environment consistent
regardless of your OS. A simple, cross-platform development workflow
might be:

## 1. Add auth credentials

In the newly created file `.env.development.local`, fill in the values for

```
GOOGLE_CLIENT_ID = FILL_IN
GOOGLE_CLIENT_SECRET = FILL_IN
```

## 2. Update your hosts file

Add the line

```
127.0.0.1 grassroots.org
```

to your hosts file, `/etc/hosts`, assuming you're developing on the machine you're browsing from.

If you're on Windows, open Notepad as Administrator, then open
`C:\Windows\System32\drivers\etc\hosts` and add:

```
127.0.0.1 grassroots.org
```

## 3. Start up Docker in one terminal

```sh
cd docker
docker compose up
```

## 5. In another terminal, set up and run the frontend application in your now running `grassroots_dev` Docker container

```sh
cd docker
docker compose exec grassroots_dev bash
cd grassroots-frontend
pnpm run start
```

## 6. In another terminal, set up and run the backend application in the same `grassroots_dev` Docker container

```sh
cd docker
docker compose exec grassroots_dev bash
cd grassroots-backend
pnpm exec mikro-orm-esm migration:up
pnpm run start
```

## 7. Install the SSL certificate

`docker compose cp caddy:/data/caddy/pki/authorities/local/root.crt $LOCAL_PATH`

You can then install in your OS (at least on Mac it's a double click).
However, most browsers have their own cert management.

On Chrome, you can add the cert via chrome://certificate-manager/.

## 8. Access the running services

- Frontend: https://grassroots.org
- Backend API: https://grassroots.org/api

# Migrations

To migrate:

```sh
pnpm exec mikro-orm-esm migration:up
```

To create a migration to the current Entity schemas.

```sh
pnpm exec mikro-orm-esm migration:create
```
