#!/usr/bin/env bash
set -euo pipefail

load_env_file() {
  local file="$1"
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line#"${line%%[![:space:]]*}"}"
    line="${line%"${line##*[![:space:]]}"}"
    [[ -z "$line" || "$line" == \#* ]] && continue
    [[ "$line" != *=* ]] && continue

    local key="${line%%=*}"
    local value="${line#*=}"
    key="${key%"${key##*[![:space:]]}"}"
    value="${value#"${value%%[![:space:]]*}"}"

    if [[ "$value" == \"*\" && "$value" == *\" ]]; then
      value="${value:1:${#value}-2}"
    elif [[ "$value" == \'*\' && "$value" == *\' ]]; then
      value="${value:1:${#value}-2}"
    fi

    export "$key=$value"
  done < "$file"
}

APP_DIR="${APP_DIR:-/srv/apps/tradeos-ai}"
BRANCH="${DEPLOY_BRANCH:-main}"
SERVICE_NAME="${SERVICE_NAME:-tradeos-ai}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3000/api/health}"
DEPLOY_ENV_FILE="${DEPLOY_ENV_FILE:-/etc/tradeos-ai/tradeos-ai.env}"

echo "Deploying TradeOS AI"
echo "App dir: ${APP_DIR}"
echo "Branch: ${BRANCH}"
echo "Service: ${SERVICE_NAME}"
echo "Env file: ${DEPLOY_ENV_FILE}"

cd "${APP_DIR}"

git fetch origin "${BRANCH}"
git checkout "${BRANCH}"
git pull --ff-only origin "${BRANCH}"

if [[ ! -r "${DEPLOY_ENV_FILE}" ]]; then
  echo "Deploy env file is missing or not readable: ${DEPLOY_ENV_FILE}" >&2
  exit 1
fi

load_env_file "${DEPLOY_ENV_FILE}"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is still empty after loading ${DEPLOY_ENV_FILE}." >&2
  echo "Check that the file contains a DATABASE_URL=... line readable by the deploy user." >&2
  exit 1
fi

echo "Loaded DATABASE_URL from env file."

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
