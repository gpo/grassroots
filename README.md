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

# Grassroots Development Setup Windows

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git (for cloning the repository)

## Quick Start

1. **Clone the repository**

```bash
git clone <repository-url>
cd grassroots
```

2. **Set up local domain (Optional)**
   **Windows:** Open Notepad as Administrator, then open `C:\Windows\System32\drivers\etc\hosts` and add:

```
127.0.0.1 grassroots.local
```

**macOS/Linux:** Edit `/etc/hosts` and add:

```
127.0.0.1 grassroots.local
```

3. **Start the application**

```bash
docker-compose -f docker/compose.yaml up -d --build
```

4. **Access the application**

- Frontend: http://localhost:5173 or http://grassroots.local
- Backend API: http://localhost:3000
- Test API endpoint: http://localhost:3000/contacts

## Development Workflow

### Full Docker Setup (Recommended)

Everything runs in containers, ensuring consistent environments across all platforms.

```bash
# Start all services
docker-compose -f docker/compose.yaml up -d --build

# View logs
docker-compose -f docker/compose.yaml logs -f

# Stop services
docker-compose -f docker/compose.yaml down
```

### Hybrid Setup (Alternative)

If you prefer to run the applications locally while keeping the database in Docker:

```bash
# Start only the database
docker-compose -f docker/compose.yaml up -d db

# Terminal 1 - Backend
cd grassroots-backend
npm install
npm run start:dev

# Terminal 2 - Frontend
cd grassroots-frontend
npm install
npm run dev
```

## Troubleshooting

### Container Issues

**Check container status:**

```bash
docker-compose -f docker/compose.yaml ps
```

**View container logs:**

```bash
docker-compose -f docker/compose.yaml logs grassroots_dev
docker-compose -f docker/compose.yaml logs db
```

**Rebuild containers:**

```bash
docker-compose -f docker/compose.yaml down
docker-compose -f docker/compose.yaml up -d --build
```

### Port Conflicts

Ensure these ports are available:

- **3000** - Backend API
- **5173** - Frontend development server

### Database Connection Issues

1. Verify the database container is running:

```bash
docker-compose -f docker/compose.yaml ps db
```

2. Check database logs:

```bash
docker-compose -f docker/compose.yaml logs db
```

3. Test database connection:

```bash
docker exec -it grassroots_db psql -U grassroots -d grassroots
```

## Development Commands

### Docker Commands

```bash
# Start development environment
docker-compose -f docker/compose.yaml up -d

# Execute commands in containers
docker exec -it grassroots_dev bash
docker exec -it grassroots_db psql -U grassroots -d grassroots

# Clean up everything
docker-compose -f docker/compose.yaml down -v
docker system prune -f
```

### Application Commands (inside containers)

```bash
# Backend
cd /app/grassroots-backend
npm install
npm run start:dev
npm test

# Frontend
cd /app/grassroots-frontend
npm install
npm run dev
npm run build
```

## Architecture

- **Frontend**: React application served on port 5173
- **Backend**: Node.js API server on port 3000
- **Database**: PostgreSQL on port 5432
- **Container Network**: All services communicate through Docker's internal network

