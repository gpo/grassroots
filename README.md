# grassroots

Political Campaign Software focused on voter outreach and volunteer management.

# Setup

Run setup.sh.

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

## Frequently Seen Problems

`duplicate key value violates unique constraint "pg_class_relname_nsp_index"`
You're modifying tables from multiple threads at the same time. Serialize whatever you're doing!

`Invalid hook call.`
You might accidentally have installed a dependency in the root package, instead of the frontend package. I'm not sure why this causes this error. Remove the dependency from the root package, `npm prune`, install it in the frontend package, and restart vite.
