#!/usr/bin/env bash
# Deploys one release of the site on the prod server. Idempotent: safe to re-run.
#
# Run from an extracted release (the pipeline does this):
#   DOMAIN=qsofte.com SSL_EMAIL=admin@qsofte.com bash deploy/deploy.sh
#
# Layout on the server:
#   /opt/qsofte/releases/<sha>/   one directory per deployed commit
#   /opt/qsofte/current           symlink to the live release
#   /opt/qsofte/shared/           certificates + ACME webroot (survive deploys)
set -euo pipefail

: "${DOMAIN:?DOMAIN must be set}"
: "${SSL_EMAIL:?SSL_EMAIL must be set}"

BASE=/opt/qsofte
SHARED_DIR=$BASE/shared
RELEASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export DOMAIN SHARED_DIR

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

$SUDO mkdir -p "$SHARED_DIR/letsencrypt" "$SHARED_DIR/certbot-www"

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
log "Building release $(basename "$RELEASE_DIR")"
compose build --pull web
log "Starting stack"
compose up -d --remove-orphans

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

# --- Mark release live and tidy up --------------------------------------------
$SUDO ln -sfn "$RELEASE_DIR" "$BASE/current"
ls -1dt "$BASE"/releases/*/ 2>/dev/null | tail -n +6 | xargs -r $SUDO rm -rf
docker image prune -f >/dev/null

log "Deployed $(basename "$RELEASE_DIR") to https://$DOMAIN"
