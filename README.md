# grassroots

Political Campaign Software focused on voter outreach and volunteer
management.

# Recommended Development Setup

We're running things in Docker. A simple, cross-platform development
workflow might be:

## 1. Run setup.sh.

```sh
./setup.sh
```

## 2. Update your hosts file

Add the line
```
127.0.0.1 grassroots.org
```
to your hosts file, `/etc/hosts`, assuming you're developing on the machine you're browsing from.

If you're one Windows, open Notepad as Administrator, then open
`C:\Windows\System32\drivers\etc\hosts` and add:

```
127.0.0.1 grassroots.org
```

## 3. Install Docker

## 4. Start up Docker in one terminal

```sh
cd docker
docker compose up
```

## 5. In another terminal, set up and run the frontend application in your now running `grassroots_dev` Docker container
```sh
cd docker
docker compose exec grassroots_dev /bin/bash
cd grassroots-frontend
npm run start
```

## 6. In another terminal, set up and run the backend application in the same `grassroots_dev` Docker container
```sh
cd docker
docker compose exec grassroots_dev /bin/bash
cd grassroots-backend
npx mikro-orm migration:up
npm run start
```

## 7. Access the running services

- Frontend: http://localhost:5173 or http://grassroots.org
- Backend API: http://localhost:3000
- Test API endpoint: http://localhost:3000/contacts

# Migrations

To migrate:

```sh
npx mikro-orm migration:up
```

To create a migration to the current Entity schemas.

```sh
npx mikro-orm migration:create
```
