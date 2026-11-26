#!/usr/bin/env bash
# Deploys one release of the site on the prod server. Idempotent: safe to re-run.
#
# Run from an extracted release, after the image has been loaded (the pipeline does both):
#   IMAGE_TAG=<sha> DOMAIN=qsofte.com SSL_EMAIL=admin@qsofte.com bash deploy/deploy.sh
#
# With DESK_DOMAIN=payments.desk.qsofte.com it also runs the Payments Desk (compose
# profile "desk"); the pipeline has already written shared/desk/desk.env.
#
# Layout on the server:
#   /opt/qsofte/releases/<sha>/   one directory per deployed commit (last 3 kept)
#   /opt/qsofte/current           symlink to the live release
#   /opt/qsofte/shared/           certificates + ACME webroot (survive deploys)
#   /opt/qsofte/shared/desk/      desk.env (secrets), db/ (Postgres data), backups/
set -euo pipefail

: "${DOMAIN:?DOMAIN must be set}"
: "${SSL_EMAIL:?SSL_EMAIL must be set}"
: "${IMAGE_TAG:?IMAGE_TAG must be set}"
DESK_DOMAIN="${DESK_DOMAIN:-}"

BASE=/opt/qsofte
SHARED_DIR=$BASE/shared
RELEASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export DOMAIN SHARED_DIR IMAGE_TAG DESK_DOMAIN

SUDO=""
[ "$(id -u)" -ne 0 ] && SUDO="sudo -n"

log() { echo "==> $*"; }

# --- Docker Compose v2 --------------------------------------------------------
if ! docker compose version >/dev/null 2>&1; then
  log "Installing Docker Compose plugin"
  if ! $SUDO apt-get install -y docker-compose-plugin >/dev/null 2>&1; then
    arch=$(uname -m)
    $SUDO mkdir -p /usr/local/lib/docker/cli-plugins
    $SUDO curl -fsSL -o /usr/local/lib/docker/cli-plugins/docker-compose \
      "https://github.com/docker/compose/releases/download/v2.30.3/docker-compose-linux-${arch}"
    $SUDO chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
  fi
fi
compose() { docker compose -f "$RELEASE_DIR/deploy/docker-compose.prod.yml" "$@"; }

$SUDO mkdir -p "$SHARED_DIR/letsencrypt" "$SHARED_DIR/certbot-www" "$SHARED_DIR/desk/db" "$SHARED_DIR/desk/backups"
# Compose reads desk.env even when the desk profile is off, so it must exist.
[ -f "$SHARED_DIR/desk/desk.env" ] || { $SUDO touch "$SHARED_DIR/desk/desk.env"; $SUDO chmod 600 "$SHARED_DIR/desk/desk.env"; }

if [ -n "$DESK_DOMAIN" ]; then
  $SUDO grep -q '^DESK_SECRET_KEY=.' "$SHARED_DIR/desk/desk.env" \
    || { echo "DESK_DOMAIN is set but $SHARED_DIR/desk/desk.env has no DESK_SECRET_KEY; the pipeline writes it from the DESK_* secrets"; exit 1; }
  docker image inspect "qsofte-desk:$IMAGE_TAG" >/dev/null \
    || { echo "Image qsofte-desk:$IMAGE_TAG not found; the pipeline loads it before running this"; exit 1; }
  export COMPOSE_PROFILES=desk
fi

# --- One-time cutover from the legacy HAProxy + host certbot setup ------------
if systemctl is-active --quiet haproxy 2>/dev/null || systemctl is-enabled --quiet haproxy 2>/dev/null; then
  log "Retiring HAProxy (the web container now owns ports 80/443)"
  $SUDO systemctl disable --now haproxy
fi
if docker ps -a --format '{{.Names}}' | grep -qx modest_lalande; then
  log "Removing legacy site container"
  docker rm -f modest_lalande
fi
# Host certbot renewed via standalone + HAProxy hooks; certs are now managed in a container.
$SUDO systemctl disable --now certbot.timer >/dev/null 2>&1 || true
$SUDO rm -f /etc/letsencrypt/renewal-hooks/pre/haproxy-stop.sh \
  /etc/letsencrypt/renewal-hooks/post/haproxy-start.sh \
  /etc/letsencrypt/renewal-hooks/deploy/haproxy-pem.sh

# --- Build and start ----------------------------------------------------------
# The image is built in CI and loaded by the pipeline; nothing is built here.
docker image inspect "qsofte-web:$IMAGE_TAG" >/dev/null \
  || { echo "Image qsofte-web:$IMAGE_TAG not found; the pipeline loads it before running this"; exit 1; }
log "Starting stack with qsofte-web:$IMAGE_TAG"
compose up -d --no-build --remove-orphans

wait_healthy() {
  for _ in $(seq 1 30); do
    if compose exec -T web wget -q -O /dev/null http://127.0.0.1/healthz 2>/dev/null; then
      return 0
    fi
    sleep 2
  done
  compose logs --tail 50 web
  return 1
}
wait_healthy || { echo "web container never became healthy"; exit 1; }

# --- First certificate (later renewals happen in the certbot container) --------
if [ ! -f "$SHARED_DIR/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
  log "Requesting certificate for $DOMAIN"
  compose run --rm --entrypoint certbot certbot certonly \
    --webroot -w /var/www/certbot -d "$DOMAIN" \
    --email "$SSL_EMAIL" --agree-tos --no-eff-email --non-interactive
  compose restart web
  wait_healthy
fi

# --- Payments Desk ---------------------------------------------------------------
if [ -n "$DESK_DOMAIN" ]; then
  desk_ok=""
  for _ in $(seq 1 45); do
    if compose exec -T desk python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/healthz', timeout=3)" 2>/dev/null; then
      desk_ok=1; break
    fi
    sleep 2
  done
  [ -n "$desk_ok" ] || { compose logs --tail 80 desk desk-db; echo "desk container never became healthy"; exit 1; }

  # Its own certificate. Needs DNS for $DESK_DOMAIN pointing here; until then the main
  # site still deploys and the Desk answers 503 over HTTP only.
  if [ ! -f "$SHARED_DIR/letsencrypt/live/$DESK_DOMAIN/fullchain.pem" ]; then
    log "Requesting certificate for $DESK_DOMAIN"
    if compose run --rm --entrypoint certbot certbot certonly \
      --webroot -w /var/www/certbot -d "$DESK_DOMAIN" \
      --email "$SSL_EMAIL" --agree-tos --no-eff-email --non-interactive; then
      compose restart web
      wait_healthy
    else
      echo "::warning::No certificate for $DESK_DOMAIN yet. Point its DNS A record at this server and deploy again."
    fi
  fi
else
  # Desk turned off: stop its containers (data in shared/desk stays).
  COMPOSE_PROFILES=desk compose stop desk desk-backup desk-db >/dev/null 2>&1 || true
fi

# --- Mark release live and tidy up --------------------------------------------
$SUDO ln -sfn "$RELEASE_DIR" "$BASE/current"
ls -1dt "$BASE"/releases/*/ 2>/dev/null | tail -n +4 | xargs -r $SUDO rm -rf
docker image prune -f >/dev/null

log "Deployed $(basename "$RELEASE_DIR") to https://$DOMAIN"
