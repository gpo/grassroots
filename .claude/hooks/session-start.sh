#!/bin/bash
set -uo pipefail

# Only run in Claude Code on the web / remote sandboxes. The container state
# is cached after this hook completes, so installs here are one-time per
# environment build, not per session.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

echo "==> pnpm install (workspace; backend postinstall bootstraps generated files)"
pnpm install || { echo "!! pnpm install failed"; exit 1; }

# gen-files-only validates the full backend Environment. The sandbox has no
# Postgres/Twilio, so provide dummy values via the gitignored .env.test.local
# (read when MODE=test, after .env.test) to let OpenAPI/metadata generation run.
if [ ! -f .env.test.local ]; then
  echo "==> writing dummy .env.test.local for sandbox builds"
  cat > .env.test.local <<'ENV'
VITE_BACKEND_HOST = https://grassroots.org/api
VITE_FRONTEND_HOST = https://grassroots.org
TWILIO_SID = dummy_for_sandbox
TWILIO_APP_SID = dummy_for_sandbox
TWILIO_AUTH_TOKEN = dummy_for_sandbox
TEST_APPROVED_PHONE_NUMBER = +15555550100
TWILIO_OUTGOING_NUMBER = +15555550101
TWILIO_API_KEY_SID = dummy_for_sandbox
TWILIO_API_KEY_SECRET = dummy_for_sandbox
TWILIO_SYNC_SERVICE_SID = dummy_for_sandbox
WEBHOOK_HOST = https://grassroots.org/webhooks
ENABLE_PHONE_CANVASS_SIMULATION = true
ENV
fi

# The backend's gen-files-only (a dependency of every turbo build/test) boots
# Nest with a live MikroORM connection, so run a throwaway Postgres. The
# container image ships Postgres 16 binaries but no service; postgres refuses
# to run as root, hence the dedicated user. The data dir survives in the
# cached container image, but the process does not survive a resume, so the
# start is re-checked on every session start.
echo "==> starting local Postgres"
PGBIN=$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | head -1)
if [ -n "$PGBIN" ]; then
  id -u pguser >/dev/null 2>&1 || useradd -m -s /bin/bash pguser
  PGDATA=/home/pguser/grassroots-pg
  mkdir -p "$PGDATA" && chown -R pguser:pguser "$PGDATA"
  su pguser -c "[ -f $PGDATA/PG_VERSION ] || $PGBIN/initdb -D $PGDATA -U postgres --auth=trust -E UTF8 >/dev/null"
  su pguser -c "$PGBIN/pg_ctl -D $PGDATA status >/dev/null 2>&1 || $PGBIN/pg_ctl -D $PGDATA -l $PGDATA/log -o '-k /tmp -p 5432 -c listen_addresses=localhost' start"
  sleep 1
  psql -h localhost -U postgres -tc "SELECT 1 FROM pg_roles WHERE rolname='test'" | grep -q 1 \
    || psql -h localhost -U postgres -c "CREATE ROLE test LOGIN PASSWORD 'test' SUPERUSER"
  psql -h localhost -U postgres -tc "SELECT 1 FROM pg_database WHERE datname='grassroots_test'" | grep -q 1 \
    || psql -h localhost -U postgres -c "CREATE DATABASE grassroots_test OWNER test"
  (cd grassroots-backend && MODE=test pnpm exec mikro-orm-esm migration:up) \
    || echo "!! migrations failed - DB-backed tests may not work"
else
  echo "!! no Postgres binaries found - builds and DB-backed tests will fail"
fi

# turbo's default strict env mode strips MODE from task environments; loose
# mode matches what CI does.
echo "==> turbo build (also generates OpenAPI bindings + backend metadata)"
MODE=test pnpm exec turbo build --env-mode=loose \
  || echo "!! turbo build failed - lint and tests may not work until this is fixed"

echo "==> session-start hook complete"
echo "    Run checks with: MODE=test pnpm exec turbo test --env-mode=loose && pnpm run check"
