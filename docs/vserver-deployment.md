# Linux VServer Deployment

This setup deploys TradeOS AI to a small Ubuntu VServer with:

- Node.js runtime
- PostgreSQL
- Nginx reverse proxy
- systemd process supervision
- GitHub Actions deployment after every push to `main`

## Server Requirements

Recommended minimum:

```txt
Ubuntu 24.04 LTS
2 vCPU
8 GB RAM
80 GB SSD
```

## 1. Install Base Packages

```bash
sudo apt update
sudo apt install -y git curl nginx postgresql postgresql-contrib certbot python3-certbot-nginx
```

Install Node.js LTS, for example via NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

## 2. Create Deploy User

```bash
sudo adduser deploy
sudo usermod -aG sudo deploy
```

Add your GitHub deploy SSH public key to:

```txt
/home/deploy/.ssh/authorized_keys
```

## 3. Create Database

```bash
sudo -u postgres psql
```

```sql
CREATE USER tradeos WITH PASSWORD 'replace-password';
CREATE DATABASE tradeos_ai OWNER tradeos;
\q
```

## 4. Clone App

```bash
sudo mkdir -p /srv/apps/tradeos-ai
sudo chown deploy:deploy /srv/apps/tradeos-ai
sudo -iu deploy
cd /srv/apps/tradeos-ai
git clone git@github.com:YOUR_ORG/YOUR_REPO.git .
npm ci
```

## 5. Configure Environment

```bash
sudo mkdir -p /etc/tradeos-ai
sudo cp /srv/apps/tradeos-ai/ops/env/tradeos-ai.env.example /etc/tradeos-ai/tradeos-ai.env
sudo nano /etc/tradeos-ai/tradeos-ai.env
sudo chown root:deploy /etc/tradeos-ai/tradeos-ai.env
sudo chmod 640 /etc/tradeos-ai/tradeos-ai.env
```

Generate secrets:

```bash
openssl rand -base64 32
openssl rand -hex 32
```

Set at least:

```txt
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
APP_ENCRYPTION_KEY
CRON_SECRET
TRADOVATE_* if using Tradovate OAuth
```

## 6. Install systemd Service

```bash
sudo cp /srv/apps/tradeos-ai/ops/systemd/tradeos-ai.service /etc/systemd/system/tradeos-ai.service
sudo systemctl daemon-reload
sudo systemctl enable tradeos-ai
```

Allow the `deploy` user to restart only this service without an interactive password:

```bash
sudo visudo -f /etc/sudoers.d/tradeos-ai-deploy
```

Add:

```txt
deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart tradeos-ai, /usr/bin/systemctl is-active --quiet tradeos-ai, /usr/bin/journalctl -u tradeos-ai -n 80 --no-pager
```

Check paths with:

```bash
which systemctl
which journalctl
```

## 7. First Manual Deploy

Run once before enabling automatic deploys:

```bash
sudo -iu deploy
cd /srv/apps/tradeos-ai
APP_DIR=/srv/apps/tradeos-ai SERVICE_NAME=tradeos-ai DEPLOY_ENV_FILE=/etc/tradeos-ai/tradeos-ai.env bash scripts/deploy.sh
```

## 8. Configure Nginx

Edit `ops/nginx/tradeos-ai.conf` and replace:

```txt
staging.example.com
```

Then:

```bash
sudo cp /srv/apps/tradeos-ai/ops/nginx/tradeos-ai.conf /etc/nginx/sites-available/tradeos-ai
sudo ln -s /etc/nginx/sites-available/tradeos-ai /etc/nginx/sites-enabled/tradeos-ai
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d staging.example.com
```

## 9. Configure GitHub Actions

Add GitHub repository secrets:

```txt
VSERVER_HOST
VSERVER_USER=deploy
VSERVER_SSH_KEY
VSERVER_SSH_PORT=22
```

Optional repository variables:

```txt
APP_DIR=/srv/apps/tradeos-ai
DEPLOY_BRANCH=main
SERVICE_NAME=tradeos-ai
HEALTH_URL=http://127.0.0.1:3000/api/health
DEPLOY_ENV_FILE=/etc/tradeos-ai/tradeos-ai.env
```

After this, every push to `main` runs:

```txt
git pull --ff-only
npm ci
prisma generate
prisma migrate deploy
next build
systemctl restart tradeos-ai
healthcheck
```

## 10. Cron Jobs

For Tradovate token refresh and automatic sync:

```bash
sudo cp /srv/apps/tradeos-ai/ops/cron/tradeos-ai /etc/cron.d/tradeos-ai
sudo nano /etc/cron.d/tradeos-ai
sudo chmod 644 /etc/cron.d/tradeos-ai
```

Set `CRON_SECRET` and `APP_URL` to match your production environment.

## Useful Commands

```bash
sudo systemctl status tradeos-ai
sudo journalctl -u tradeos-ai -f
curl -fsS http://127.0.0.1:3000/api/health
```
