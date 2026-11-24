#!/usr/bin/env bash
# Frees disk on the prod server before a deploy, using only safe cleanups.
# Streamed over SSH by deploy-prod.yml (it must run before anything is written to disk).
#
#   - systemd journal beyond 200 MB, apt package cache, packages apt marks as no
#     longer needed (old kernels/headers), old qsofte releases (3 newest kept)
#   - then Docker images no container uses, and the build cache
#
# Order matters: on a 100%-full disk Docker cannot record deletions, so a prune
# fails until something else has freed a little room first.
#
# Never touches Docker volumes, running/stopped containers, or other apps' files.
# Fails with a report of the biggest directories if less than MIN_FREE_MB is still free.
set -uo pipefail

MIN_FREE_MB=${MIN_FREE_MB:-600}
SUDO=""
[ "$(id -u)" -ne 0 ] && SUDO="sudo -n"

free_mb() { df -Pm /opt | awk 'NR==2 {print $4}'; }

free_before=$(free_mb)
echo "==> Disk before cleanup"
df -h / /opt /var/lib/docker 2>/dev/null | sort -u

# 1. Non-Docker space first, so Docker has room to work.
$SUDO journalctl --vacuum-size=200M >/dev/null 2>&1 || true
$SUDO apt-get clean >/dev/null 2>&1 || true
$SUDO env DEBIAN_FRONTEND=noninteractive apt-get autoremove --purge -y -qq >/dev/null 2>&1 || true
if [ -d /opt/qsofte/releases ]; then
  ls -1dt /opt/qsofte/releases/*/ 2>/dev/null | tail -n +4 | xargs -r $SUDO rm -rf
fi
echo "==> ${free_before:-?} MB -> $(free_mb) MB free after system cleanup"

# 2. Docker: unused images and build cache. Twice, in case the first pass ran
#    out of room part-way. Output is shown so a failure is visible.
for pass in 1 2; do
  echo "==> Docker prune (pass $pass)"
  docker image prune -af 2>&1 | tail -1 || true
  docker builder prune -af 2>&1 | tail -1 || true
done

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
