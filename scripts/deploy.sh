#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/tradeos-ai}"
BRANCH="${DEPLOY_BRANCH:-main}"
SERVICE_NAME="${SERVICE_NAME:-tradeos-ai}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3000/api/health}"

echo "Deploying TradeOS AI"
echo "App dir: ${APP_DIR}"
echo "Branch: ${BRANCH}"
echo "Service: ${SERVICE_NAME}"

cd "${APP_DIR}"

git fetch origin "${BRANCH}"
git checkout "${BRANCH}"
git pull --ff-only origin "${BRANCH}"

npm ci
npm run db:generate
npm run db:deploy
npm run build

sudo -n systemctl restart "${SERVICE_NAME}"
sudo -n systemctl is-active --quiet "${SERVICE_NAME}"

for attempt in {1..20}; do
  if curl -fsS "${HEALTH_URL}" >/dev/null; then
    echo "Healthcheck passed: ${HEALTH_URL}"
    exit 0
  fi
  echo "Waiting for healthcheck (${attempt}/20)..."
  sleep 2
done

echo "Healthcheck failed: ${HEALTH_URL}" >&2
sudo -n journalctl -u "${SERVICE_NAME}" -n 80 --no-pager >&2
exit 1
