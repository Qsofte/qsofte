#!/usr/bin/env bash
# Frees disk on the prod server before a deploy, using only safe cleanups.
# Streamed over SSH by deploy-prod.yml (it must run before anything is written to disk).
#
#   - Docker images no container uses, and the build cache
#   - systemd journal beyond 200 MB, apt package cache
#   - old qsofte releases (the 3 newest are kept)
#
# Never touches Docker volumes, running/stopped containers, or other apps' files.
# Fails with a report of the biggest directories if less than MIN_FREE_MB is still free.
set -uo pipefail

MIN_FREE_MB=${MIN_FREE_MB:-1024}
SUDO=""
[ "$(id -u)" -ne 0 ] && SUDO="sudo -n"

free_mb() { df -Pm /opt | awk 'NR==2 {print $4}'; }

echo "==> Disk before cleanup"
df -h / /opt /var/lib/docker 2>/dev/null | sort -u

docker image prune -af >/dev/null 2>&1 || true
docker builder prune -af >/dev/null 2>&1 || true
$SUDO journalctl --vacuum-size=200M >/dev/null 2>&1 || true
$SUDO apt-get clean >/dev/null 2>&1 || true
if [ -d /opt/qsofte/releases ]; then
  ls -1dt /opt/qsofte/releases/*/ 2>/dev/null | tail -n +4 | xargs -r $SUDO rm -rf
fi

echo "==> Disk after cleanup"
df -h / /opt /var/lib/docker 2>/dev/null | sort -u

avail=$(free_mb)
if [ "$avail" -lt "$MIN_FREE_MB" ]; then
  echo "::error::Only ${avail} MB free on /opt after safe cleanup (need ${MIN_FREE_MB} MB)."
  echo "Biggest directories (clear or expand the disk, then re-run the deploy):"
  $SUDO du -xh --max-depth=3 / 2>/dev/null | sort -rh | head -25
  echo "Docker usage:"
  docker system df 2>/dev/null || true
  echo "Largest container logs:"
  $SUDO sh -c 'ls -1S /var/lib/docker/containers/*/*-json.log 2>/dev/null | head -5 | xargs -r du -h'
  exit 1
fi
echo "==> ${avail} MB free, OK to deploy"
