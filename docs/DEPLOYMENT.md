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
3. The release is copied to the server over SSH, then on the server:
   - new `backend`, `migrate`, `createadmin`, `seedweb` binaries and `migrations/` are put in place,
     and `./migrate` updates the NEWCOM_WEB tables (safe to re-run);
   - `npm ci --omit=dev` runs only when `package-lock.json` changed;
   - `.next/` and `public/` are swapped in;
   - both services restart and a health check waits for 200 from both ports.
4. `backend/.env`, `backend/uploads/` and `frontend/.env.production` on the server are never touched.

Pull requests to `main` run the build and tests only (no deploy). You can also run
"Build and deploy" by hand from the Actions tab.

## One-time setup

### 1. Server

Node.js (for `npm`) must be installed; Go is not needed on the server (binaries are built by GitHub).

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

`npm run start` runs `next start -p 9042` (see `frontend/package.json`).

```bash
sudo systemctl daemon-reload
sudo systemctl enable webNewcom.service webNewcom_frontend.service
```

Caddy (`/etc/caddy/Caddyfile`), then `sudo systemctl reload caddy`:

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
| `SSH_KNOWN_HOSTS` | optional; output of `ssh-keyscan 54.255.127.30` to pin the host key |

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

## Troubleshooting

```bash
sudo journalctl -u webNewcom.service -n 100 --no-pager
sudo journalctl -u webNewcom_frontend.service -n 100 --no-pager
sudo journalctl -u caddy -n 50 --no-pager
```

- **Deploy fails at "Upload release":** check `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY` and that the
  public key is in `~/.ssh/authorized_keys`.
- **Deploy fails at migrate:** the server can't reach SQL Server, or `backend/.env` is missing.
- **Health check fails:** read the journal lines printed in the job log.
- **Admin sign-in loops back to the login page:** `WEB_ORIGIN` in `backend/.env` must be exactly
  `https://newcom.auralflix.com`.
- **Product photos show generic category pictures:** the AWS keys in `backend/.env` are missing or invalid.
