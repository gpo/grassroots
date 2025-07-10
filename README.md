# grassroots

Political Campaign Software focused on voter outreach and volunteer management.

# Recommended Development Setup

First, make sure you've installed:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git (for cloning the repository)

We're running things in Docker. We can develop our code in a running Docker container to keep the development environment consistent regardless of your OS.

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

If you're on Windows, open Notepad as Administrator, then open `C:\Windows\System32\drivers\etc\hosts` and add:

```
127.0.0.1 grassroots.org
```

## 3. Development with Container Run Script (Recommended)

We provide a cross-platform `./run` script that automatically manages containers and routes commands appropriately. This is the simplest way to develop:

```bash
# Make it executable
chmod +x run

# Automatically starts all services and runs commands in container
./run "cd grassroots-backend && npx mikro-orm migration:up"
./run "cd grassroots-backend && npm run start:dev"
./run "cd grassroots-frontend && npm run dev"

# Open shell in container for interactive development
./run bash
```

### Command Syntax

**Always use quotes around commands with `&&` operators:**

- ✅ Correct: `./run "cd grassroots-backend && npm install"`
- ❌ Incorrect: `./run cd grassroots-backend && npm install`

### Cross-Platform Usage

- **macOS/Linux**: Works in any terminal
- **Windows**: Use Git Bash (comes with Git)

## 4. Alternative: Manual Docker Setup

If you prefer manual control over containers:

### Start up Docker in one terminal

```sh
cd docker
docker compose up
```

### In another terminal, set up and run the frontend application

```sh
cd docker
docker compose exec grassroots_dev bash
cd grassroots-frontend
npm run start
```

### In another terminal, set up and run the backend application

```sh
cd docker
docker compose exec grassroots_dev bash
cd grassroots-backend
npx mikro-orm migration:up
npm run start
```

## 5. Install the SSL certificate

`docker compose cp caddy:/data/caddy/pki/authorities/local/root.crt $LOCAL_PATH`

You can then install in your OS (at least on Mac it's a double click). However, most browsers have their own cert management.

On Chrome, you can add the cert via chrome://certificate-manager/.

## 6. Access the running services

- Frontend: https://grassroots.org
- Backend API: https://grassroots.org/api

# Common Development Commands

Using the `./run` script for everyday development:

```bash
# Backend development
./run "cd grassroots-backend && npm install"
./run "cd grassroots-backend && npm run start:dev"
./run "cd grassroots-backend && npm test"

# Frontend development
./run "cd grassroots-frontend && npm install"
./run "cd grassroots-frontend && npm run dev"
./run "cd grassroots-frontend && npm run build"

# Database operations
./run "cd grassroots-backend && npx mikro-orm migration:up"
./run "cd grassroots-backend && npx mikro-orm migration:create"

# General commands
./run npm --version
./run git status
```

# Git Hooks Integration

The run script works seamlessly with git hooks:

```bash
# Example .git/hooks/pre-commit
#!/bin/bash
./run "cd grassroots-backend && npm run lint"
./run "cd grassroots-backend && npm test"
```

# Migrations

To migrate:

```sh
./run "cd grassroots-backend && npx mikro-orm migration:up"
```

To create a migration to the current Entity schemas:

```sh
./run "cd grassroots-backend && npx mikro-orm migration:create"
```

# Troubleshooting

## Container Run Script Issues

| Issue                   | Solution                                    |
| ----------------------- | ------------------------------------------- |
| Permission denied       | `chmod +x run`                              |
| Docker not found        | Install Docker Desktop                      |
| Container startup fails | Check Docker is running, try manual startup |

## Manual Container Management

```bash
# Start all services
docker compose -f docker/compose.yaml up -d

# Stop all services
docker compose -f docker/compose.yaml down

# View status
docker compose -f docker/compose.yaml ps
```
