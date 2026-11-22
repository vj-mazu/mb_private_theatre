#!/usr/bin/env bash
# Movie Bash — one-command install for a fresh Ubuntu VPS (Hostinger KVM).
#   sudo bash deploy/install.sh
# Asks for domain, database name/user/password and admin login (or generates secure values),
# writes .env, opens the firewall, starts website + PostgreSQL + HTTPS, and schedules daily backups.
set -euo pipefail
cd "$(dirname "$0")/.."

say() { printf '\n\033[1;34m> %s\033[0m\n' "$1"; }
ask() { local p="$1" d="${2:-}" v; read -r -p "$p${d:+ [$d]}: " v; echo "${v:-$d}"; }
secret() { openssl rand -base64 "$1" | tr -d '/+=\n' | cut -c1-"$2"; }

[ "$(id -u)" -eq 0 ] || { echo "Please run with sudo: sudo bash deploy/install.sh"; exit 1; }

say "Checking Docker"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
docker compose version >/dev/null

if [ -f .env ]; then
  say ".env already exists - keeping your settings"
else
  say "A few questions (press Enter to accept the suggestion)"
  DOMAIN=$(ask "Your domain (without https://)" "moviebash.in")
  DB_NAME=$(ask "Database name" "moviebash")
  DB_USER=$(ask "Database user" "moviebash")
  DB_PASS=$(ask "Database password (Enter = generate a strong one)" "$(secret 32 28)")
  ADMIN_USER=$(ask "Admin username" "admin")
  ADMIN_PASS=$(ask "Admin password (min 10 chars, Enter = generate)" "$(secret 24 16)")
  WA_TOKEN=$(ask "WhatsApp Cloud API token (optional, Enter to skip)" "")
  WA_PHONE=$(ask "WhatsApp phone-number ID (optional)" "")

  {
    echo "DOMAIN=${DOMAIN}"
    echo "NEXT_PUBLIC_APP_URL=https://${DOMAIN}"
    echo "JWT_SECRET=$(secret 64 64)"
    echo "POSTGRES_DB=${DB_NAME}"
    echo "POSTGRES_USER=${DB_USER}"
    echo "POSTGRES_PASSWORD=${DB_PASS}"
    echo "ADMIN_USERNAME=${ADMIN_USER}"
    echo "ADMIN_PASSWORD=${ADMIN_PASS}"
    echo "WHATSAPP_TOKEN=${WA_TOKEN}"
    echo "WHATSAPP_PHONE_NUMBER_ID=${WA_PHONE}"
    echo "WHATSAPP_API_VERSION=v21.0"
    echo "WHATSAPP_TEMPLATE_LANG=en"
  } > .env
  chmod 600 .env
  echo "Saved .env (readable by root only)."
fi

say "Firewall: allowing only SSH, HTTP and HTTPS"
if command -v ufw >/dev/null 2>&1; then
  ufw allow 22/tcp >/dev/null
  ufw allow 80/tcp >/dev/null
  ufw allow 443/tcp >/dev/null
  ufw --force enable >/dev/null || true
fi

say "Building and starting (first time takes 3-5 minutes)"
mkdir -p backups
chown -R 1001:1001 backups   # the app container runs as user 1001 and writes the nightly backups here
docker compose up -d --build
docker image prune -f >/dev/null 2>&1 || true

say "Scheduling a daily database backup at 02:30"
CRON="30 2 * * * cd $(pwd) && docker compose exec -T app node scripts/db-backup.js >> backups/backup.log 2>&1"
( crontab -l 2>/dev/null | grep -v 'scripts/db-backup.js' ; echo "$CRON" ) | crontab -

say "Waiting for the site to become healthy"
for _ in $(seq 1 60); do
  if docker compose exec -T app wget -qO- http://127.0.0.1:3000/api/health >/dev/null 2>&1; then break; fi
  sleep 3
done

# shellcheck disable=SC1091
source .env
printf '\n\033[1;32mMovie Bash is running\033[0m\n'
echo "  Website : https://${DOMAIN}"
echo "  Admin   : https://${DOMAIN}/admin/login"
echo "  Login   : ${ADMIN_USERNAME} / ${ADMIN_PASSWORD}   (change it after signing in)"
echo "  Logs    : docker compose logs -f app"
