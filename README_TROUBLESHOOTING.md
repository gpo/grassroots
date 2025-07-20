# Frequently Seen Problems

`duplicate key value violates unique constraint
"pg_class_relname_nsp_index"` You're modifying tables from multiple
threads at the same time. Serialize whatever you're doing!

`Invalid hook call.` You might accidentally have installed a
dependency in the root package, instead of the frontend package. I'm
not sure why this causes this error. Remove the dependency from the
root package, `pnpm prune`, install it in the frontend package, and
restart vite.

When migrating the database with `docker compose exec grassroots_dev
bash -c "cd grassroots-backend && pnpm exec mikro-orm migration:up"` you get
`MODULE_NOT_FOUND`

```
docker compose exec grassroots_dev bash -c "cd grassroots-backend && pnpm i"
docker compose exec grassroots_dev bash -c "cd grassroots-backend && pnpm audit fix"
docker compose exec grassroots_dev bash -c "cd grassroots-backend && pnpm exec mikro-orm migration:up"
```

# Environment Variables

Environment variables are read both within and outside the nestJS
context (for mikro-orm.config.ts and GlobalSetup.ts). Due to this, we
don't inject the ConfigModule for tests, instead, we define a
different set of env files for development vs test.

# Container Issues

**Check container status:**

```bash
docker compose -f docker/compose.yaml ps
```

**View container logs:**

```bash
docker compose -f docker/compose.yaml logs grassroots_dev
docker compose -f docker/compose.yaml logs db
```

**Rebuild containers:**

```bash
docker compose -f docker/compose.yaml down
docker compose -f docker/compose.yaml up --build
```

# Port Conflicts

Ensure these ports are available:

- **3000** - Backend API
- **5173** - Frontend development server

# Database Connection Issues

1. Verify the database container is running:

```bash
docker compose -f docker/compose.yaml ps db
```

2. Check database logs:

```bash
docker compose -f docker/compose.yaml logs db
```

3. Test database connection:

```bash
docker exec -it db psql -U grassroots -d grassroots
docker exec -it test_db psql -U grassroots -d grassroots
```

# Miscellaneous Docker Commands

```bash
# Start development environment
docker compose -f docker/compose.yaml up

# Execute commands in containers
docker exec -it grassroots_dev bash
docker exec -it db psql -U grassroots grassroots
docker exec -it test_db psql -U grassroots grassroots

# Clean up everything
docker compose -f docker/compose.yaml down -v
docker system prune -f
```
