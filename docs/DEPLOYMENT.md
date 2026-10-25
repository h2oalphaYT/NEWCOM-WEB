# Deploying Newcom Web

Production runs on one Ubuntu EC2 server (54.255.127.30). Every push to `main` on GitHub builds,
tests and deploys automatically (`.github/workflows/deploy.yml`).

| Part | Address | Runs on the server | systemd service |
|---|---|---|---|
| Frontend (Next.js) | https://newcom.auralflix.com | `/home/ubuntu/webnewcom/frontend`, `npm run start` on port 9042 | `webNewcom_frontend.service` |
| Backend (Go API) | https://api.newcom.auralflix.com | `/home/ubuntu/webnewcom/backend/backend` on port 9040 | `webNewcom.service` |

Caddy terminates HTTPS and proxies to the two ports. Keep 9040 and 9042 closed in the EC2
security group; only 22, 80 and 443 need to be open.

## How a deployment works

1. Push (or merge a pull request) to `main`.
2. GitHub Actions: `go vet` + `go test`, builds the Linux backend binaries, runs `npm ci` and
   `next build` with `NEXT_PUBLIC_API_URL=https://api.newcom.auralflix.com`.
3. The release is copied to the server over SSH (host key checked) and `deploy/remote-deploy.sh` runs there:
   1. **Checks, no changes yet:** `.env` files present, passwordless sudo, both services exist, and the
      frontend service runs npm from a Node.js >= 20.9 folder with that folder first in its `PATH`.
      The Node folder is read from `webNewcom_frontend.service` itself, so the service is the one
      place that decides which Node the site uses.
   2. **Stage, no changes yet:** unpack into a temp folder next to the live one; run
      `npm ci --omit=dev` there when `package-lock.json` changed.
   3. **Migrate:** `./migrate` updates the NEWCOM_WEB tables (additive and re-runnable; see below).
   4. **Backend:** keep the running binary as `backend.prev`, swap in the new one, restart
      `webNewcom.service`, wait for `/api/health` = 200. If it fails, `backend.prev` is put back
      and restarted, and the deploy stops before touching the frontend.
   5. **Frontend:** move `.next`, `public`, package files (and `node_modules` if reinstalled) to
      `*.prev`, move the new ones in, restart `webNewcom_frontend.service`, wait for 200 on 9042.
      If it fails, the `*.prev` copies are put back and the service restarted.
4. `backend/.env`, `backend/uploads/` and `frontend/.env.production` are never touched. No other
   service, Caddy, the system Node.js or global settings are changed.

Pull requests to `main` run the build and tests only (no deploy). You can also run
"Build and deploy" by hand from the Actions tab.

## One-time setup

### 1. Server

Next.js 16 needs Node.js 20 or newer. The frontend gets its own Node 22 in `/opt/node22`; the
system Node.js and other apps on the server are not changed. Go is not needed on the server.
See "Node.js 22 for the frontend" below.

```bash
mkdir -p /home/ubuntu/webnewcom/backend /home/ubuntu/webnewcom/frontend
```

Copy the two env files from your PC (both are kept out of git):

```bash
scp backend/.env.production  ubuntu@54.255.127.30:/home/ubuntu/webnewcom/backend/.env
scp frontend/.env.production ubuntu@54.255.127.30:/home/ubuntu/webnewcom/frontend/.env.production
ssh ubuntu@54.255.127.30 chmod 600 /home/ubuntu/webnewcom/backend/.env
```

`backend/.env` must contain `PORT=9040`, `WEB_ORIGIN=https://newcom.auralflix.com`,
`COOKIE_SECURE=true`, a long `JWT_KEY`, the database settings and the AWS keys.
`frontend/.env.production` contains `NEWCOM_API_URL=http://127.0.0.1:9040` and
`NEXT_PUBLIC_API_URL=https://api.newcom.auralflix.com`.

Service files (names must match the `BACKEND_SERVICE` / `FRONTEND_SERVICE` variables below):

`/etc/systemd/system/webNewcom.service`

```ini
[Unit]
Description=NEWCOM WEBSITE Backend Service
StartLimitIntervalSec=500
StartLimitBurst=5
[Service]
ExecStart=/home/ubuntu/webnewcom/backend/backend
WorkingDirectory=/home/ubuntu/webnewcom/backend
Restart=on-failure
RestartSec=5s
[Install]
WantedBy=multi-user.target
```

`/etc/systemd/system/webNewcom_frontend.service`

```ini
[Unit]
Description=NEWCOM WEBSITE Frontend Service
StartLimitIntervalSec=500
StartLimitBurst=5
[Service]
ExecStart=/usr/bin/npm run start
WorkingDirectory=/home/ubuntu/webnewcom/frontend
Restart=always
RestartSec=10
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production
User=ubuntu
[Install]
WantedBy=multi-user.target
```

`npm run start` runs `next start -p 9042` (see `frontend/package.json`). The drop-in below switches
this service to Node 22 without editing the file above.

#### Node.js 22 for the frontend

First look at what is there (read-only, changes nothing):

```bash
for d in /usr/bin /usr/local/bin /opt/*/bin; do [ -x "$d/node" ] && echo "$d/node $($d/node -v)"; done
ls -ld /opt/node* 2>/dev/null
systemctl cat webNewcom_frontend.service
systemctl show -p ExecStart -p Environment webNewcom_frontend.service
ls -l /etc/systemd/system/webNewcom_frontend.service.d/ 2>/dev/null
```

- If a folder such as `/opt/node-v22/bin` already has Node v22 (or any version >= 20.9), you can use
  it instead of installing: change both `/opt/node22` paths in `node22.conf` to that folder.
- If `/opt/node22` exists but is empty (left from an earlier attempt), the installer uses it.
- If `/opt/node22` holds something else, the installer stops without touching it; pick another
  folder with `NODE_DIR=/opt/node22-newcom bash /tmp/install-node22.sh` and use that path in `node22.conf`.

From the project folder on your PC, copy the installer and the drop-in to the server:

```bash
scp deploy/install-node22.sh deploy/systemd/webNewcom_frontend.service.d/node22.conf ubuntu@54.255.127.30:/tmp/
```

On the server:

```bash
bash /tmp/install-node22.sh                     # verifies the download checksum; installs to /opt/node22 only
/opt/node22/bin/node -v                         # v22.x

sudo mkdir -p /etc/systemd/system/webNewcom_frontend.service.d
sudo install -m 644 /tmp/node22.conf /etc/systemd/system/webNewcom_frontend.service.d/node22.conf
sudo systemctl daemon-reload
systemctl cat webNewcom_frontend.service        # shows the original unit plus the node22.conf drop-in
systemctl show -p ExecStart --value webNewcom_frontend.service   # path=/opt/node22/bin/npm
sudo systemd-analyze verify webNewcom_frontend.service           # no output = valid
sudo systemctl reset-failed webNewcom_frontend.service
```

To have the next deploy reinstall the packages with Node 22, move the Node 18 ones aside (not deleted):
`mv /home/ubuntu/webnewcom/frontend/node_modules /home/ubuntu/webnewcom/frontend/node_modules.node18`.
Remove `node_modules.node18` yourself once the site runs. If Node 22 or the drop-in is missing,
the deploy stops at its first check and changes nothing on the server.

```bash
sudo systemctl daemon-reload
sudo systemctl enable webNewcom.service webNewcom_frontend.service
```

Caddy (`/etc/caddy/Caddyfile`) is already set up as below; deploys never change it:

```
https://api.newcom.auralflix.com {
    reverse_proxy 127.0.0.1:9040
    encode zstd gzip
}

https://newcom.auralflix.com {
    reverse_proxy 127.0.0.1:9042
    encode zstd gzip
}
```

The `ubuntu` user needs passwordless `sudo` for `systemctl restart` (the default on Ubuntu EC2 images).

### 2. Deploy key

On your PC, make a key used only by GitHub:

```bash
ssh-keygen -t ed25519 -C "github-deploy-newcom" -f newcom_deploy -N ""
```

Add the public half to the server:

```bash
ssh ubuntu@54.255.127.30 "cat >> ~/.ssh/authorized_keys" < newcom_deploy.pub
```

### 3. GitHub settings

Repository → Settings → Secrets and variables → Actions:

| Secret | Value |
|---|---|
| `SSH_HOST` | `54.255.127.30` |
| `SSH_USER` | `ubuntu` |
| `SSH_PRIVATE_KEY` | the whole contents of `newcom_deploy` (the private key file) |
| `SSH_PORT` | optional, default 22 |
| `SSH_KNOWN_HOSTS` | recommended; pins the server's host key (see below). Without it the key is trusted on first contact and the run shows a warning |

To make `SSH_KNOWN_HOSTS`, run on your PC `ssh-keyscan -t ed25519 54.255.127.30` and check that
its fingerprint matches the server's own (`ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub` on the
server, compared with `ssh-keyscan -t ed25519 54.255.127.30 | ssh-keygen -lf -` on your PC). Paste the
`ssh-keyscan` line as the secret.

Variables (optional, only if you use different names):
`BACKEND_SERVICE` (default `webNewcom.service`), `FRONTEND_SERVICE` (default `webNewcom_frontend.service`),
`DEPLOY_DIR` (default `/home/ubuntu/webnewcom`), `NEXT_PUBLIC_API_URL`
(default `https://api.newcom.auralflix.com`).

Delete the local `newcom_deploy` private key file after pasting it into GitHub.

### 4. First run

Push to `main` (or Actions → Build and deploy → Run workflow). When it is green:

- https://newcom.auralflix.com shows the site,
- https://api.newcom.auralflix.com/api/health returns `{"db":"up","success":true}`,
- create the admin login on the server if needed:
  `cd /home/ubuntu/webnewcom/backend && ./createadmin -email you@newcom.lk -name "Your Name"`,
- optional starter content: `./seedweb`.

## Rollback and database migrations

- Each deploy keeps the previous version next to the live one: `backend/backend.prev`,
  `backend/migrations.prev`, `frontend/.next.prev`, `frontend/public.prev` and the `*.prev` package
  files. A failed health check restores them automatically.
- Manual rollback of the last deploy (only the two NEWCOM services are restarted):

  ```bash
  cd /home/ubuntu/webnewcom/backend && cp -p backend.prev backend && sudo systemctl restart webNewcom.service
  cd /home/ubuntu/webnewcom/frontend
  for x in .next public package.json package-lock.json next.config.mjs; do
    if [ -e "$x.prev" ]; then rm -rf "$x" && mv "$x.prev" "$x"; fi
  done
  sudo systemctl restart webNewcom_frontend.service
  ```

- **Migrations are not rolled back.** `migrations/*.sql` only add tables, columns and indexes
  (`IF ... IS NULL` guards), so the previous backend keeps working with the new schema. Any future
  migration that drops, renames or rewrites data must not go out through this pipeline unreviewed:
  take a database backup first and release it on its own.

## Troubleshooting

```bash
sudo journalctl -u webNewcom.service -n 100 --no-pager
sudo journalctl -u webNewcom_frontend.service -n 100 --no-pager
sudo journalctl -u caddy -n 50 --no-pager
```

- **Deploy fails at "Upload release":** check `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY` and that the
  public key is in `~/.ssh/authorized_keys`.
- **"still runs the system npm" / "Node ... not found" / "PATH must start with":** the Node 22 install
  or the `node22.conf` drop-in is missing or points at another folder; see "Node.js 22 for the frontend".
- **Deploy fails at migrate:** the server can't reach SQL Server, or `backend/.env` is missing.
- **Health check fails:** read the journal lines printed in the job log.
- **Admin sign-in loops back to the login page:** `WEB_ORIGIN` in `backend/.env` must be exactly
  `https://newcom.auralflix.com`.
- **Product photos show generic category pictures:** the AWS keys in `backend/.env` are missing or invalid.
