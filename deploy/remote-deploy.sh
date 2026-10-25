#!/usr/bin/env bash
# Runs ON THE SERVER, piped over SSH by .github/workflows/deploy.yml. Touches only the NEWCOM
# folders and the two NEWCOM services. Never changes .env files, uploads/, Caddy, system Node.js
# or any other service.
#
# Order: read-only checks -> stage everything in a temp folder (incl. npm ci) -> database migration
# -> backend swap + restart + health check -> frontend swap + restart + health check. A service that
# does not come up is rolled back to its previous files and restarted. One previous copy is kept.
#
# Env: DEPLOY_DIR, BACKEND_SERVICE, FRONTEND_SERVICE, RELEASE (uploaded .tgz),
#      BACKEND_PORT (9040), FRONTEND_PORT (9042)
set -euo pipefail

: "${DEPLOY_DIR:?}" "${BACKEND_SERVICE:?}" "${FRONTEND_SERVICE:?}" "${RELEASE:?}"
BACKEND_PORT="${BACKEND_PORT:-9040}"
FRONTEND_PORT="${FRONTEND_PORT:-9042}"
B="$DEPLOY_DIR/backend"
F="$DEPLOY_DIR/frontend"

log() { echo "[deploy] $*"; }
fail() { echo "::error::$*"; exit 1; }

# ---------------------------------------------------------------- 1. checks (no changes yet)
[ -f "$RELEASE" ] || fail "release archive $RELEASE not found"
[ -f "$B/.env" ] || fail "$B/.env is missing; copy it to the server first (docs/DEPLOYMENT.md)"
[ -f "$F/.env.production" ] || fail "$F/.env.production is missing; copy it to the server first"
sudo -n true 2>/dev/null || fail "user $(id -un) needs passwordless sudo for systemctl"
systemctl cat "$BACKEND_SERVICE" >/dev/null 2>&1 || fail "service $BACKEND_SERVICE not found"
systemctl cat "$FRONTEND_SERVICE" >/dev/null 2>&1 || fail "service $FRONTEND_SERVICE not found"

# The frontend's Node.js is whatever npm the frontend service runs (set by the node22.conf
# drop-in). Using the service as the single source of truth means the workflow, the service and
# the install folder can never disagree about the path.
NPM_BIN=$(systemctl show -p ExecStart --value "$FRONTEND_SERVICE" | sed -n 's/^{ path=\([^ ;]*\).*/\1/p' | head -n1)
[ -n "$NPM_BIN" ] || fail "could not read ExecStart of $FRONTEND_SERVICE"
NODE_DIR=$(dirname "$NPM_BIN")
if [ "$NODE_DIR" = "/usr/bin" ] || [ "$NODE_DIR" = "/usr/local/bin" ]; then
  fail "$FRONTEND_SERVICE still runs the system npm ($NPM_BIN, Node $(node -v 2>/dev/null || echo '?')). Install Node 22 with deploy/install-node22.sh and the node22.conf drop-in (docs/DEPLOYMENT.md)."
fi
[ -x "$NODE_DIR/node" ] || fail "$NODE_DIR/node not found; $FRONTEND_SERVICE points at $NPM_BIN. Run deploy/install-node22.sh."
"$NODE_DIR/node" -e 'const [a,b]=process.versions.node.split(".").map(Number);process.exit(a>20||(a===20&&b>=9)?0:1)' \
  || fail "Node $("$NODE_DIR/node" -v) in $NODE_DIR is too old; Next.js needs >= 20.9.0"
# "next" starts with "#!/usr/bin/env node", so the service PATH must find this node before /usr/bin/node
SVC_PATH=$(systemctl show -p Environment --value "$FRONTEND_SERVICE" | tr ' ' '\n' | sed -n 's/^PATH=//p' | tail -n1)
case "$SVC_PATH" in
  "$NODE_DIR":*|"$NODE_DIR") ;;
  *) fail "$FRONTEND_SERVICE PATH must start with $NODE_DIR (now: ${SVC_PATH:-unset}); install the node22.conf drop-in" ;;
esac
export PATH="$NODE_DIR:$PATH"
log "frontend runtime: node $(node -v), npm $(npm -v) from $NODE_DIR"

# ---------------------------------------------------------------- 2. stage (no changes yet)
mkdir -p "$B" "$F"
STAGE=$(mktemp -d "$DEPLOY_DIR/.stage.XXXXXX")   # same disk as the live folders, so mv is instant
trap 'rm -rf "$STAGE"' EXIT
tar -xzf "$RELEASE" -C "$STAGE"
for x in backend/backend backend/migrate backend/migrations frontend/.next frontend/public frontend/package-lock.json; do
  [ -e "$STAGE/$x" ] || fail "release is incomplete: $x missing"
done

DEPS_CHANGED=0
if ! cmp -s "$STAGE/frontend/package-lock.json" "$F/package-lock.json" || [ ! -d "$F/node_modules" ]; then
  log "installing frontend packages (lockfile changed or node_modules missing)"
  (cd "$STAGE/frontend" && npm ci --omit=dev --no-audit --no-fund)
  DEPS_CHANGED=1
fi

# ---------------------------------------------------------------- 3. database migration
# Migrations only ADD tables/columns/indexes (idempotent, re-runnable), so the previous backend
# keeps working on the new schema. They are NOT rolled back automatically; a migration that
# drops or renames anything must be released separately with a manual backup first.
log "running database migrations"
ln -s "$B/.env" "$STAGE/backend/.env"
(cd "$STAGE/backend" && ./migrate)
rm -f "$STAGE/backend/.env"

# ---------------------------------------------------------------- 4. helpers
restart() { sudo systemctl reset-failed "$1" 2>/dev/null || true; sudo systemctl restart "$1"; }
healthy() { # url, tries (3 s apart)
  local code=""
  for _ in $(seq 1 "$2"); do
    code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$1" || true)
    if [ "$code" = 200 ]; then return 0; fi
    sleep 3
  done
  echo "[deploy] $1 answered ${code:-nothing}"
  return 1
}

# ---------------------------------------------------------------- 5. backend: swap, restart, check
# the previous binary is kept as backend.prev for rollback
if [ -f "$B/backend" ]; then cp -p "$B/backend" "$B/backend.prev"; fi
install -m 755 "$STAGE/backend/backend" "$B/backend.new"
for t in migrate createadmin seedweb; do
  if [ -f "$STAGE/backend/$t" ]; then install -m 755 "$STAGE/backend/$t" "$B/$t"; fi
done
rm -rf "$B/migrations.prev"
if [ -d "$B/migrations" ]; then mv "$B/migrations" "$B/migrations.prev"; fi
mv "$STAGE/backend/migrations" "$B/migrations"
mv -f "$B/backend.new" "$B/backend"

restart "$BACKEND_SERVICE"
if ! healthy "http://127.0.0.1:$BACKEND_PORT/api/health" 20; then
  sudo journalctl -u "$BACKEND_SERVICE" -n 40 --no-pager || true
  if [ -f "$B/backend.prev" ]; then
    log "backend unhealthy: restoring previous binary"
    cp -p "$B/backend.prev" "$B/backend"
    restart "$BACKEND_SERVICE"
    if healthy "http://127.0.0.1:$BACKEND_PORT/api/health" 10; then log "previous backend is running again"; fi
  fi
  fail "new backend did not start; rolled back (frontend untouched; the additive migration stays applied)"
fi
log "backend healthy on :$BACKEND_PORT"

# ---------------------------------------------------------------- 6. frontend: swap, restart, check
# build output, assets, package files and (only if changed) node_modules; previous copies kept as *.prev
FRONT_ITEMS=".next public package.json package-lock.json next.config.mjs"
if [ "$DEPS_CHANGED" = 1 ]; then FRONT_ITEMS="$FRONT_ITEMS node_modules"; fi
for x in $FRONT_ITEMS; do rm -rf "$F/$x.prev"; done
for x in $FRONT_ITEMS; do
  if [ -e "$F/$x" ]; then mv "$F/$x" "$F/$x.prev"; fi
  mv "$STAGE/frontend/$x" "$F/$x"
done

restart "$FRONTEND_SERVICE"
if ! healthy "http://127.0.0.1:$FRONTEND_PORT/" 30; then
  sudo journalctl -u "$FRONTEND_SERVICE" -n 40 --no-pager || true
  log "frontend unhealthy: restoring previous build"
  for x in $FRONT_ITEMS; do
    if [ -e "$F/$x.prev" ]; then rm -rf "${F:?}/$x"; mv "$F/$x.prev" "$F/$x"; fi
  done
  restart "$FRONTEND_SERVICE"
  if healthy "http://127.0.0.1:$FRONTEND_PORT/" 20; then log "previous frontend is running again"; fi
  fail "new frontend did not start; rolled back to the previous build (backend stays on the new version)"
fi
log "frontend healthy on :$FRONTEND_PORT"

# ---------------------------------------------------------------- 7. tidy up
rm -f "$RELEASE"
rm -rf "$F/node_modules.prev"   # large; .next.prev, public.prev and backend.prev stay for manual rollback
log "deployed: backend :$BACKEND_PORT and frontend :$FRONTEND_PORT both answer 200"
