#!/usr/bin/env bash
# Renews Let's Encrypt certificates on the prod server (HAProxy + certbot standalone)
# and installs certbot hooks so the server's own auto-renewal works from now on.
#
# Usage (run on the server):  bash renew-certs.sh [force]
set -euo pipefail

FORCE="${1:-}"
SUDO=""
[ "$(id -u)" -ne 0 ] && SUDO="sudo -n"

HAPROXY_CERT_DIR=/etc/haproxy/certs
HOOKS=/etc/letsencrypt/renewal-hooks

# 1. Install renewal hooks (idempotent).
#    certbot standalone needs port 80, which HAProxy holds; without these hooks
#    every automatic renewal fails and the certs silently expire.
#    Hooks only run when a cert is actually being renewed, so no needless downtime.
$SUDO mkdir -p "$HOOKS/pre" "$HOOKS/post" "$HOOKS/deploy" "$HAPROXY_CERT_DIR"

$SUDO tee "$HOOKS/pre/haproxy-stop.sh" >/dev/null <<'EOF'
#!/bin/sh
systemctl stop haproxy
EOF

$SUDO tee "$HOOKS/post/haproxy-start.sh" >/dev/null <<'EOF'
#!/bin/sh
systemctl start haproxy
EOF

# HAProxy wants cert chain + private key in a single PEM file.
$SUDO tee "$HOOKS/deploy/haproxy-pem.sh" >/dev/null <<'EOF'
#!/bin/sh
set -e
name=$(basename "$RENEWED_LINEAGE")
umask 077
cat "$RENEWED_LINEAGE/fullchain.pem" "$RENEWED_LINEAGE/privkey.pem" > "/etc/haproxy/certs/$name.pem"
EOF

$SUDO chmod 755 "$HOOKS/pre/haproxy-stop.sh" "$HOOKS/post/haproxy-start.sh" "$HOOKS/deploy/haproxy-pem.sh"

# 2. Renew. Expired certs are always due, so a plain renew picks them up.
echo "== Renewing certificates"
if [ "$FORCE" = "force" ]; then
  $SUDO certbot renew --non-interactive --force-renewal
else
  $SUDO certbot renew --non-interactive
fi

# 3. Make sure HAProxy is up and its config (and cert files) are valid.
$SUDO haproxy -c -f /etc/haproxy/haproxy.cfg
$SUDO systemctl is-active --quiet haproxy || $SUDO systemctl start haproxy
$SUDO systemctl reload haproxy

# 4. Verify: fail if any cert expires within 14 days.
echo "== Certificate status"
$SUDO certbot certificates
status=0
for d in $($SUDO ls /etc/letsencrypt/live); do
  f="/etc/letsencrypt/live/$d/cert.pem"
  $SUDO test -f "$f" || continue
  end=$($SUDO openssl x509 -enddate -noout -in "$f")
  if $SUDO openssl x509 -checkend 1209600 -noout -in "$f" >/dev/null; then
    echo "OK   $d  $end"
  else
    echo "FAIL $d  $end  (expired or expiring within 14 days)"
    status=1
  fi
done
exit $status
