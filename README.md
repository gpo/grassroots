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
